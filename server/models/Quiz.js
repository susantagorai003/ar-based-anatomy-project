import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['multiple-choice', 'organ-identification', 'drag-drop', 'true-false', 'fill-blank']
    },
    question: {
        type: String,
        required: true
    },
    // For multiple choice
    options: [{
        id: String,
        text: String,
        isCorrect: Boolean
    }],
    // For organ identification
    targetOrgan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organ'
    },
    modelReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnatomyModel'
    },
    hotspotId: String, // Which hotspot to identify
    // For drag-drop labeling
    labels: [{
        id: String,
        text: String,
        correctPosition: { x: Number, y: Number }
    }],
    // Answer info
    correctAnswer: String, // For fill-blank and true-false
    explanation: {
        type: String,
        required: true
    },
    hint: String,
    // Media
    image: String,
    // Metadata
    points: {
        type: Number,
        default: 1
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    timeLimit: {
        type: Number, // in seconds
        default: 60
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    instructions: {
        type: String
    },
    // Quiz configuration
    system: {
        type: String,
        enum: [
            'skeletal',
            'muscular',
            'organs',
            'circulatory',
            'nervous',
            'respiratory',
            'digestive',
            'urinary',
            'reproductive-male',
            'reproductive-female',
            'endocrine',
            'lymphatic',
            'integumentary',
            'special-senses',
            'mixed'
        ]
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    },
    questions: [questionSchema],
    // Settings
    totalPoints: {
        type: Number,
        default: 0
    },
    passingScore: {
        type: Number,
        default: 60 // percentage
    },
    timeLimit: {
        type: Number, // in minutes, 0 = unlimited
        default: 0
    },
    shuffleQuestions: {
        type: Boolean,
        default: true
    },
    shuffleOptions: {
        type: Boolean,
        default: true
    },
    showAnswersAfter: {
        type: Boolean,
        default: true
    },
    allowRetake: {
        type: Boolean,
        default: true
    },
    maxAttempts: {
        type: Number,
        default: 0 // 0 = unlimited
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    // Metadata
    thumbnail: String,
    tags: [String],
    attemptCount: {
        type: Number,
        default: 0
    },
    averageScore: {
        type: Number,
        default: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Create slug from title before saving
quizSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    // Calculate total points
    this.totalPoints = this.questions.reduce((sum, q) => sum + q.points, 0);
    next();
});

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
