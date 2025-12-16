import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Activity type
    action: {
        type: String,
        required: true,
        enum: [
            'view_model',
            'view_organ',
            'ar_session_start',
            'ar_session_end',
            'ar_interaction',
            'quiz_start',
            'quiz_complete',
            'module_start',
            'module_complete',
            'section_complete',
            'bookmark_add',
            'bookmark_remove',
            'note_create',
            'note_update',
            'search',
            'voice_command',
            'login',
            'logout'
        ]
    },
    // Related entities
    anatomyModel: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnatomyModel'
    },
    organ: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organ'
    },
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module'
    },
    // Session tracking
    sessionId: String,
    // Duration for timed activities
    duration: {
        type: Number, // in seconds
        default: 0
    },
    // Additional metadata
    metadata: {
        searchQuery: String,
        voiceCommand: String,
        interactionType: String, // rotate, zoom, tap, etc.
        score: Number,
        deviceType: String,
        browser: String,
        os: String,
        isAR: Boolean
    },
    // Location data (optional, for analytics)
    location: {
        country: String,
        region: String,
        city: String
    },
    // IP for rate limiting (hashed)
    ipHash: String
}, {
    timestamps: true
});

// Index for efficient queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;
