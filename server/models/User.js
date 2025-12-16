import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student'
    },
    avatar: {
        type: String,
        default: ''
    },
    institution: {
        type: String,
        trim: true,
        default: ''
    },
    yearOfStudy: {
        type: Number,
        min: 1,
        max: 10
    },
    specialization: {
        type: String,
        trim: true
    },
    // Learning statistics
    stats: {
        totalPoints: { type: Number, default: 0 }, // Accumulated quiz points
        totalStudyTime: { type: Number, default: 0 }, // in minutes
        modulesCompleted: { type: Number, default: 0 },
        quizzesTaken: { type: Number, default: 0 },
        averageScore: { type: Number, default: 0 },
        arInteractions: { type: Number, default: 0 },
        modelsViewed: { type: Number, default: 0 }
    },
    // Recently viewed organs/models
    recentlyViewed: [{
        model: { type: mongoose.Schema.Types.ObjectId, ref: 'AnatomyModel' },
        viewedAt: { type: Date, default: Date.now }
    }],
    // Preferences
    preferences: {
        theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
        language: { type: String, default: 'en' },
        notifications: { type: Boolean, default: true },
        arQuality: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Get full name virtual
userSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model('User', userSchema);
export default User;
