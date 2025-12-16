import mongoose from 'mongoose';

const bookmarkSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Can bookmark either a model or an organ
    anatomyModel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnatomyModel'
    },
    organ: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organ'
    },
    // Organization
    folder: {
        type: String,
        default: 'default'
    },
    tags: [String],
    // Notes specific to this bookmark
    note: {
        type: String,
        maxlength: 500
    },
    // Priority for quick access
    isPinned: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: '#3B82F6' // blue
    }
}, {
    timestamps: true
});

// Ensure user can't bookmark same item twice
bookmarkSchema.index({ user: 1, anatomyModel: 1 }, { unique: true, sparse: true });
bookmarkSchema.index({ user: 1, organ: 1 }, { unique: true, sparse: true });

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);
export default Bookmark;
