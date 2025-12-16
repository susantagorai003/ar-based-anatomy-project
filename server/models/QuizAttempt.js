import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
    questionId: {
        type: String,
        required: true
    },
    questionType: {
        type: String,
        required: true
    },
    userAnswer: mongoose.Schema.Types.Mixed, // Can be string, array, object depending on question type
    correctAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: {
        type: Boolean,
        required: true
    },
    pointsEarned: {
        type: Number,
        default: 0
    },
    timeTaken: {
        type: Number, // in seconds
        default: 0
    }
});

const quizAttemptSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    // Attempt details
    answers: [answerSchema],
    // Scoring
    score: {
        type: Number,
        required: true,
        default: 0
    },
    totalPoints: {
        type: Number,
        required: true
    },
    percentage: {
        type: Number,
        required: true,
        default: 0
    },
    passed: {
        type: Boolean,
        default: false
    },
    // Statistics
    correctAnswers: {
        type: Number,
        default: 0
    },
    incorrectAnswers: {
        type: Number,
        default: 0
    },
    skippedQuestions: {
        type: Number,
        default: 0
    },
    // Time tracking
    startedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    completedAt: {
        type: Date
    },
    timeTaken: {
        type: Number, // in seconds
        default: 0
    },
    // Attempt metadata
    attemptNumber: {
        type: Number,
        default: 1
    },
    isCompleted: {
        type: Boolean,
        default: false
    },
    // Performance breakdown by difficulty
    performanceByDifficulty: {
        easy: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
        medium: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
        hard: { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } }
    },
    // Performance breakdown by question type
    performanceByType: {
        'multiple-choice': { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
        'organ-identification': { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
        'drag-drop': { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
        'true-false': { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
        'fill-blank': { correct: { type: Number, default: 0 }, total: { type: Number, default: 0 } }
    }
}, {
    timestamps: true
});

// Calculate percentage before saving
quizAttemptSchema.pre('save', function (next) {
    if (this.totalPoints > 0) {
        this.percentage = Math.round((this.score / this.totalPoints) * 100);
    }
    next();
});

// Index for efficient queries
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ user: 1, createdAt: -1 });

const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
export default QuizAttempt;
