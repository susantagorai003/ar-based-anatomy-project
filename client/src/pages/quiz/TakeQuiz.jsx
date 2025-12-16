import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiClock, FiChevronLeft, FiChevronRight, FiCheck,
    FiX, FiAlertCircle, FiFlag, FiAward, FiArrowRight
} from 'react-icons/fi';
import {
    fetchQuizBySlug, submitQuiz,
    selectCurrentQuiz, selectActiveSession, selectQuizLoading, selectQuizSubmitting,
    startQuizSession, setAnswer, nextQuestion, prevQuestion, setCurrentQuestion
} from '../../store/slices/quizSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const TakeQuiz = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const quiz = useSelector(selectCurrentQuiz);
    const session = useSelector(selectActiveSession);
    const isLoading = useSelector(selectQuizLoading);
    const isSubmitting = useSelector(selectQuizSubmitting);
    const user = useSelector(selectCurrentUser);

    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [timeLeft, setTimeLeft] = useState(null);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [quizResult, setQuizResult] = useState(null);

    // Login protection - redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login', {
                state: {
                    from: `/quiz/${slug}`,
                    message: 'Please login to take the quiz and earn points!'
                }
            });
        }
    }, [user, navigate, slug]);

    useEffect(() => {
        if (user) {
            dispatch(fetchQuizBySlug(slug));
        }
    }, [dispatch, slug, user]);

    useEffect(() => {
        if (quiz && !session.quizId) {
            dispatch(startQuizSession({
                quizId: quiz._id,
                totalQuestions: quiz.questions.length,
                timeLimit: quiz.timeLimit
            }));
        }
    }, [quiz, session.quizId, dispatch]);

    // Timer
    useEffect(() => {
        if (session.timeRemaining && session.timeRemaining > 0) {
            setTimeLeft(session.timeRemaining);
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [session.timeRemaining]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (answer) => {
        dispatch(setAnswer({
            questionIndex: session.currentQuestion,
            answer: {
                questionId: currentQuestion._id,
                answer
            }
        }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;

        const answers = session.answers.filter(a => a !== null);
        const timeTaken = quiz.timeLimit
            ? (quiz.timeLimit * 60) - (timeLeft || 0)
            : Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);

        try {
            const result = await dispatch(submitQuiz({
                quizId: quiz._id,
                answers,
                startedAt: session.startedAt,
                timeTaken
            })).unwrap();

            setQuizResult(result);
            setShowConfirmSubmit(false);
            setShowScoreModal(true);
            toast.success('Quiz submitted!');
        } catch (err) {
            toast.error(err || 'Failed to submit quiz');
        }
    };

    const handleViewDetailedResults = () => {
        navigate(`/quiz/${slug}/result`);
    };

    if (isLoading || !quiz) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const currentQuestion = quiz.questions[session.currentQuestion];
    const currentAnswer = session.answers[session.currentQuestion];
    const answeredCount = session.answers.filter(a => a !== null).length;
    const progress = ((session.currentQuestion + 1) / quiz.questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="glass-card p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="font-semibold text-gray-900 dark:text-white">
                            {quiz.title}
                        </h1>
                        {timeLeft !== null && (
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                <FiClock className="w-4 h-4" />
                                <span className="font-mono font-medium">{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="progress-bar mb-2">
                        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span>Question {session.currentQuestion + 1} of {quiz.questions.length}</span>
                        <span>{answeredCount} answered</span>
                    </div>
                </div>

                {/* Question */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={session.currentQuestion}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="glass-card p-6 mb-6"
                    >
                        <div className="flex items-start gap-3 mb-6">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center font-semibold">
                                {session.currentQuestion + 1}
                            </span>
                            <div>
                                <p className="text-lg text-gray-900 dark:text-white font-medium">
                                    {currentQuestion.question}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    {currentQuestion.points} point{currentQuestion.points > 1 ? 's' : ''} • {currentQuestion.type.replace('-', ' ')}
                                </p>
                            </div>
                        </div>

                        {/* Answer options based on question type */}
                        {currentQuestion.type === 'multiple-choice' && (
                            <div className="space-y-3">
                                {currentQuestion.options.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleAnswer(option.id)}
                                        className={`quiz-option w-full text-left ${currentAnswer?.answer === option.id ? 'selected' : ''
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${currentAnswer?.answer === option.id
                                                ? 'border-primary-500 bg-primary-500'
                                                : 'border-gray-300 dark:border-gray-600'
                                                }`}>
                                                {currentAnswer?.answer === option.id && (
                                                    <FiCheck className="w-3 h-3 text-white" />
                                                )}
                                            </div>
                                            <span>{option.text}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentQuestion.type === 'true-false' && (
                            <div className="grid grid-cols-2 gap-4">
                                {['true', 'false'].map((value) => (
                                    <button
                                        key={value}
                                        onClick={() => handleAnswer(value)}
                                        className={`quiz-option text-center py-6 ${currentAnswer?.answer === value ? 'selected' : ''
                                            }`}
                                    >
                                        <span className="text-lg font-semibold capitalize">{value}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {currentQuestion.type === 'fill-blank' && (
                            <input
                                type="text"
                                value={currentAnswer?.answer || ''}
                                onChange={(e) => handleAnswer(e.target.value)}
                                placeholder="Type your answer..."
                                className="input-field text-lg"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => dispatch(prevQuestion())}
                        disabled={session.currentQuestion === 0}
                        className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                    >
                        <FiChevronLeft className="w-5 h-5" />
                        Previous
                    </button>

                    <div className="flex items-center gap-2">
                        {quiz.questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => dispatch(setCurrentQuestion(idx))}
                                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${idx === session.currentQuestion
                                    ? 'bg-primary-500 text-white'
                                    : session.answers[idx]
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>

                    {session.currentQuestion === quiz.questions.length - 1 ? (
                        <button
                            onClick={() => setShowConfirmSubmit(true)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <FiFlag className="w-5 h-5" />
                            Submit Quiz
                        </button>
                    ) : (
                        <button
                            onClick={() => dispatch(nextQuestion())}
                            className="btn-primary flex items-center gap-2"
                        >
                            Next
                            <FiChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Submit confirmation modal */}
                <AnimatePresence>
                    {showConfirmSubmit && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="modal-overlay"
                            onClick={() => setShowConfirmSubmit(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="glass-card p-6 max-w-md mx-4"
                                onClick={e => e.stopPropagation()}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                                        <FiAlertCircle className="w-6 h-6 text-yellow-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 dark:text-white">Submit Quiz?</h3>
                                        <p className="text-sm text-gray-500">
                                            {answeredCount} of {quiz.questions.length} questions answered
                                        </p>
                                    </div>
                                </div>

                                {answeredCount < quiz.questions.length && (
                                    <p className="text-sm text-orange-600 dark:text-orange-400 mb-4">
                                        You have {quiz.questions.length - answeredCount} unanswered questions!
                                    </p>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowConfirmSubmit(false)}
                                        className="flex-1 btn-secondary"
                                    >
                                        Continue Quiz
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting}
                                        className="flex-1 btn-primary"
                                    >
                                        {isSubmitting ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Score Result Modal */}
                <AnimatePresence>
                    {showScoreModal && quizResult && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="modal-overlay"
                        >
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                transition={{ type: 'spring', damping: 20 }}
                                className="glass-card p-8 max-w-md mx-4 text-center"
                            >
                                {/* Score Circle */}
                                <div className="relative w-32 h-32 mx-auto mb-6">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke="currentColor"
                                            strokeWidth="10"
                                            fill="none"
                                            className="text-gray-200 dark:text-gray-700"
                                        />
                                        <motion.circle
                                            cx="64"
                                            cy="64"
                                            r="56"
                                            stroke={quizResult.percentage >= 70 ? '#22c55e' : quizResult.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                                            strokeWidth="10"
                                            fill="none"
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: '0 352' }}
                                            animate={{ strokeDasharray: `${quizResult.percentage * 3.52} 352` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.span
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="text-3xl font-bold text-gray-900 dark:text-white"
                                        >
                                            {quizResult.percentage}%
                                        </motion.span>
                                    </div>
                                </div>

                                {/* Pass/Fail Badge */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5, type: 'spring' }}
                                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 ${quizResult.passed
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                        }`}
                                >
                                    {quizResult.passed ? (
                                        <>
                                            <FiAward className="w-5 h-5" />
                                            <span className="font-semibold">Congratulations! You Passed!</span>
                                        </>
                                    ) : (
                                        <>
                                            <FiX className="w-5 h-5" />
                                            <span className="font-semibold">Keep Practicing!</span>
                                        </>
                                    )}
                                </motion.div>

                                {/* Quiz Title */}
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {quiz?.title || 'Quiz Complete!'}
                                </h2>
                                <p className="text-gray-500 dark:text-gray-400 mb-6">
                                    {quizResult.passed
                                        ? 'Great job! You demonstrated excellent knowledge.'
                                        : 'Don\'t give up! Review the material and try again.'}
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                                        <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                                            <FiCheck className="w-4 h-4" />
                                            <span className="text-xs font-medium">Correct</span>
                                        </div>
                                        <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                            {quizResult.correctAnswers}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                                        <div className="flex items-center justify-center gap-1 text-red-600 dark:text-red-400 mb-1">
                                            <FiX className="w-4 h-4" />
                                            <span className="text-xs font-medium">Incorrect</span>
                                        </div>
                                        <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                                            {quizResult.incorrectAnswers}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                                        <div className="flex items-center justify-center gap-1 text-primary-600 dark:text-primary-400 mb-1">
                                            <FiAward className="w-4 h-4" />
                                            <span className="text-xs font-medium">Score</span>
                                        </div>
                                        <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                                            {quizResult.score}/{quizResult.totalPoints}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={handleViewDetailedResults}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    View Detailed Results
                                    <FiArrowRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default TakeQuiz;
