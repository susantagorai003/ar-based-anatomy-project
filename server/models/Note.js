import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Note can be associated with organ, model, quiz, or module
    organ: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organ'
    },
    anatomyModel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnatomyModel'
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    },
    // Note content
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    content: {
        type: String,
        required: true
    },
    // Rich text / markdown support
    contentType: {
        type: String,
        enum: ['plain', 'markdown', 'html'],
        default: 'markdown'
    },
    // Organization
    folder: {
        type: String,
        default: 'general'
    },
    tags: [String],
    color: {
        type: String,
        default: '#fbbf24' // amber
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    // Revision history
    revisions: [{
        content: String,
        editedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Index for search
noteSchema.index({ user: 1, title: 'text', content: 'text' });

const Note = mongoose.model('Note', noteSchema);
export default Note;
