import mongoose from 'mongoose';

const moduleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Module title is required'],
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
    objectives: [String],
    // Module content
    system: {
        type: String,
        required: true,
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
            'special-senses'
        ]
    },
    // Learning content
    organs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organ'
    }],
    models: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnatomyModel'
    }],
    quizzes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    // Module structure
    sections: [{
        title: String,
        content: String, // Markdown/HTML content
        organs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organ' }],
        models: [{ type: mongoose.Schema.Types.ObjectId, ref: 'AnatomyModel' }],
        videoUrl: String,
        order: Number
    }],
    // Prerequisites
    prerequisites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    }],
    // Metadata
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    estimatedTime: {
        type: Number, // in minutes
        default: 30
    },
    thumbnail: String,
    tags: [String],
    order: {
        type: Number,
        default: 0
    },
    // Statistics
    completionCount: {
        type: Number,
        default: 0
    },
    averageRating: {
        type: Number,
        default: 0
    },
    ratingCount: {
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
moduleSchema.pre('save', function (next) {
    if (this.isModified('title')) {
        this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    next();
});

const Module = mongoose.model('Module', moduleSchema);
export default Module;
