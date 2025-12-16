import mongoose from 'mongoose';

const anatomyModelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Model name is required'],
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
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String
    },
    // 3D Model files
    modelFile: {
        type: String, // Path to .glb/.gltf file
        required: true
    },
    modelFormat: {
        type: String,
        enum: ['glb', 'gltf'],
        default: 'glb'
    },
    thumbnail: {
        type: String
    },
    // Model properties
    scale: {
        type: Number,
        default: 1
    },
    position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 }
    },
    rotation: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        z: { type: Number, default: 0 }
    },
    // Hotspots for interactive parts
    hotspots: [{
        id: String,
        name: String,
        position: {
            x: Number,
            y: Number,
            z: Number
        },
        normal: {
            x: Number,
            y: Number,
            z: Number
        },
        description: String,
        linkedOrgan: { type: mongoose.Schema.Types.ObjectId, ref: 'Organ' }
    }],
    // Metadata
    fileSize: Number, // in bytes
    polyCount: Number,
    isARCompatible: {
        type: Boolean,
        default: true
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    tags: [String],
    viewCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Create slug from name before saving
anatomyModelSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    next();
});

// Index for search
anatomyModelSchema.index({ name: 'text', description: 'text', tags: 'text' });

const AnatomyModel = mongoose.model('AnatomyModel', anatomyModelSchema);
export default AnatomyModel;
