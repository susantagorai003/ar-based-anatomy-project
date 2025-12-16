import mongoose from 'mongoose';

const organSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Organ name is required'],
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    latinName: {
        type: String,
        trim: true
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
    // Detailed information
    description: {
        type: String,
        required: true
    },
    function: {
        type: String,
        required: true
    },
    location: {
        type: String
    },
    structure: {
        type: String
    },
    // Clinical information
    clinicalRelevance: {
        type: String
    },
    relatedDisorders: [{
        name: String,
        description: String,
        symptoms: [String]
    }],
    surgicalNotes: {
        type: String
    },
    // Relationships
    connectedOrgans: [{
        organ: { type: mongoose.Schema.Types.ObjectId, ref: 'Organ' },
        relationship: String
    }],
    bloodSupply: {
        arteries: [String],
        veins: [String]
    },
    nerveSupply: [String],
    lymphaticDrainage: [String],
    // Media
    images: [{
        url: String,
        caption: String,
        type: { type: String, enum: ['diagram', 'photo', 'xray', 'mri', 'ct'] }
    }],
    model: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AnatomyModel'
    },
    // Learning
    keyFacts: [String],
    mnemonics: [{
        text: String,
        explanation: String
    }],
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    // Metadata
    tags: [String],
    viewCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Create slug from name before saving
organSchema.pre('save', function (next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    next();
});

// Index for search
organSchema.index({ name: 'text', latinName: 'text', description: 'text', tags: 'text' });

const Organ = mongoose.model('Organ', organSchema);
export default Organ;
