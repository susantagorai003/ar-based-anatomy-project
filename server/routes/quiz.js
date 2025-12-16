import express from 'express';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import User from '../models/User.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/quiz
// @desc    Get all quizzes
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { system, difficulty, module, page = 1, limit = 20 } = req.query;

        const query = { isPublished: true, isActive: true };

        if (system) query.system = system;
        if (difficulty) query.difficulty = difficulty;
        if (module) query.module = module;

        const total = await Quiz.countDocuments(query);
        const quizzes = await Quiz.find(query)
            .select('title slug description system difficulty totalPoints timeLimit attemptCount averageScore thumbnail tags')
            .populate('module', 'title slug')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: quizzes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get quizzes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quizzes'
        });
    }
});

// @route   GET /api/quiz/:slug
// @desc    Get quiz by slug (with questions for taking)
// @access  Private
router.get('/:slug', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ slug: req.params.slug, isActive: true })
            .populate('module', 'title slug');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Get user's attempt count
        const attemptCount = await QuizAttempt.countDocuments({
            user: req.user._id,
            quiz: quiz._id
        });

        // Check if max attempts reached
        if (quiz.maxAttempts > 0 && attemptCount >= quiz.maxAttempts) {
            return res.status(403).json({
                success: false,
                message: 'Maximum attempts reached for this quiz'
            });
        }

        // Prepare quiz for taking (hide correct answers)
        const quizData = quiz.toObject();
        quizData.questions = quizData.questions.map(q => {
            const question = { ...q };

            // Hide correct answers
            if (question.options) {
                question.options = question.options.map(opt => ({
                    id: opt.id,
                    text: opt.text
                }));
            }
            delete question.correctAnswer;

            return question;
        });

        // Shuffle if enabled
        if (quiz.shuffleQuestions) {
            quizData.questions = quizData.questions.sort(() => Math.random() - 0.5);
        }
        if (quiz.shuffleOptions) {
            quizData.questions = quizData.questions.map(q => {
                if (q.options) {
                    q.options = q.options.sort(() => Math.random() - 0.5);
                }
                return q;
            });
        }

        quizData.userAttemptCount = attemptCount;

        res.json({
            success: true,
            data: quizData
        });
    } catch (error) {
        console.error('Get quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quiz'
        });
    }
});

// @route   POST /api/quiz/:id/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const { answers, startedAt, timeTaken } = req.body;

        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        // Get attempt count
        const attemptCount = await QuizAttempt.countDocuments({
            user: req.user._id,
            quiz: quiz._id
        });

        // Process answers and calculate score
        let score = 0;
        let correctAnswers = 0;
        let incorrectAnswers = 0;

        const processedAnswers = quiz.questions.map(question => {
            const userAnswer = answers.find(a => a.questionId === question._id.toString());
            let isCorrect = false;
            let pointsEarned = 0;

            if (userAnswer) {
                switch (question.type) {
                    case 'multiple-choice':
                        const correctOption = question.options.find(o => o.isCorrect);
                        isCorrect = correctOption && userAnswer.answer === correctOption.id;
                        break;
                    case 'true-false':
                        isCorrect = userAnswer.answer === question.correctAnswer;
                        break;
                    case 'fill-blank':
                        isCorrect = userAnswer.answer?.toLowerCase().trim() === question.correctAnswer?.toLowerCase().trim();
                        break;
                    case 'organ-identification':
                        isCorrect = userAnswer.answer === question.hotspotId;
                        break;
                    case 'drag-drop':
                        // Check if all labels are in correct positions
                        if (Array.isArray(userAnswer.answer) && Array.isArray(question.labels)) {
                            isCorrect = question.labels.every(label => {
                                const userLabel = userAnswer.answer.find(a => a.id === label.id);
                                return userLabel &&
                                    Math.abs(userLabel.x - label.correctPosition.x) < 20 &&
                                    Math.abs(userLabel.y - label.correctPosition.y) < 20;
                            });
                        }
                        break;
                }

                if (isCorrect) {
                    pointsEarned = question.points;
                    score += pointsEarned;
                    correctAnswers++;
                } else {
                    incorrectAnswers++;
                }
            } else {
                incorrectAnswers++;
            }

            return {
                questionId: question._id.toString(),
                questionType: question.type,
                userAnswer: userAnswer?.answer,
                correctAnswer: question.type === 'multiple-choice'
                    ? question.options.find(o => o.isCorrect)?.id
                    : question.correctAnswer,
                isCorrect,
                pointsEarned,
                timeTaken: userAnswer?.timeTaken || 0
            };
        });

        const percentage = Math.round((score / quiz.totalPoints) * 100);
        const passed = percentage >= quiz.passingScore;

        // Create attempt record
        const attempt = await QuizAttempt.create({
            user: req.user._id,
            quiz: quiz._id,
            answers: processedAnswers,
            score,
            totalPoints: quiz.totalPoints,
            percentage,
            passed,
            correctAnswers,
            incorrectAnswers,
            skippedQuestions: quiz.questions.length - answers.length,
            startedAt: startedAt || new Date(),
            completedAt: new Date(),
            timeTaken: timeTaken || 0,
            attemptNumber: attemptCount + 1,
            isCompleted: true
        });

        // Update quiz statistics
        quiz.attemptCount += 1;
        quiz.averageScore = ((quiz.averageScore * (quiz.attemptCount - 1)) + percentage) / quiz.attemptCount;
        await quiz.save();

        // Update user statistics
        const user = await User.findById(req.user._id);
        user.stats.quizzesTaken += 1;
        user.stats.totalPoints = (user.stats.totalPoints || 0) + score; // Add earned points to total
        user.stats.averageScore = ((user.stats.averageScore * (user.stats.quizzesTaken - 1)) + percentage) / user.stats.quizzesTaken;
        await user.save();

        // Prepare response with explanations if enabled
        let responseData = {
            _id: attempt._id,
            score,
            totalPoints: quiz.totalPoints,
            percentage,
            passed,
            correctAnswers,
            incorrectAnswers,
            timeTaken: attempt.timeTaken
        };

        if (quiz.showAnswersAfter) {
            responseData.answers = processedAnswers.map((ans, idx) => ({
                ...ans,
                explanation: quiz.questions[idx].explanation,
                correctAnswer: quiz.questions[idx].type === 'multiple-choice'
                    ? quiz.questions[idx].options.find(o => o.isCorrect)
                    : quiz.questions[idx].correctAnswer
            }));
        }

        res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Submit quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting quiz',
            error: error.message
        });
    }
});

// @route   GET /api/quiz/:id/attempts
// @desc    Get user's attempts for a quiz
// @access  Private
router.get('/:id/attempts', protect, async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({
            user: req.user._id,
            quiz: req.params.id
        })
            .select('score totalPoints percentage passed correctAnswers timeTaken attemptNumber createdAt')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: attempts
        });
    } catch (error) {
        console.error('Get attempts error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attempts'
        });
    }
});

// @route   GET /api/quiz/attempt/:id
// @desc    Get specific attempt details
// @access  Private
router.get('/attempt/:id', protect, async (req, res) => {
    try {
        const attempt = await QuizAttempt.findById(req.params.id)
            .populate('quiz', 'title slug questions showAnswersAfter');

        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: 'Attempt not found'
            });
        }

        if (attempt.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this attempt'
            });
        }

        res.json({
            success: true,
            data: attempt
        });
    } catch (error) {
        console.error('Get attempt error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching attempt'
        });
    }
});

// @route   POST /api/quiz
// @desc    Create new quiz (admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const quiz = await Quiz.create({
            ...req.body,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        console.error('Create quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating quiz',
            error: error.message
        });
    }
});

// @route   PUT /api/quiz/:id
// @desc    Update quiz (admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.json({
            success: true,
            data: quiz
        });
    } catch (error) {
        console.error('Update quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating quiz'
        });
    }
});

// @route   DELETE /api/quiz/:id
// @desc    Delete quiz (admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const quiz = await Quiz.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!quiz) {
            return res.status(404).json({
                success: false,
                message: 'Quiz not found'
            });
        }

        res.json({
            success: true,
            message: 'Quiz deleted successfully'
        });
    } catch (error) {
        console.error('Delete quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting quiz'
        });
    }
});

export default router;
