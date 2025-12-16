import express from 'express';
import Module from '../models/Module.js';
import { protect, adminOnly, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/modules
// @desc    Get all modules
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { system, difficulty, page = 1, limit = 20 } = req.query;

        const query = { isPublished: true, isActive: true };

        if (system) query.system = system;
        if (difficulty) query.difficulty = difficulty;

        const total = await Module.countDocuments(query);
        const modules = await Module.find(query)
            .select('title slug description system difficulty estimatedTime thumbnail completionCount averageRating order')
            .populate('prerequisites', 'title slug')
            .sort({ order: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: modules,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get modules error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching modules'
        });
    }
});

// @route   GET /api/modules/:slug
// @desc    Get module by slug
// @access  Public
router.get('/:slug', optionalAuth, async (req, res) => {
    try {
        const module = await Module.findOne({ slug: req.params.slug, isActive: true })
            .populate('organs', 'name slug description system')
            .populate('models', 'name slug thumbnail modelFile')
            .populate('quizzes', 'title slug description difficulty totalPoints')
            .populate('prerequisites', 'title slug')
            .populate('sections.organs', 'name slug')
            .populate('sections.models', 'name slug thumbnail');

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        res.json({
            success: true,
            data: module
        });
    } catch (error) {
        console.error('Get module error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching module'
        });
    }
});

// @route   POST /api/modules
// @desc    Create module (admin only)
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const module = await Module.create({
            ...req.body,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: module
        });
    } catch (error) {
        console.error('Create module error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating module',
            error: error.message
        });
    }
});

// @route   PUT /api/modules/:id
// @desc    Update module (admin only)
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const module = await Module.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        res.json({
            success: true,
            data: module
        });
    } catch (error) {
        console.error('Update module error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating module'
        });
    }
});

// @route   DELETE /api/modules/:id
// @desc    Delete module (admin only)
// @access  Private/Admin
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const module = await Module.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        res.json({
            success: true,
            message: 'Module deleted successfully'
        });
    } catch (error) {
        console.error('Delete module error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting module'
        });
    }
});

// @route   POST /api/modules/:id/rate
// @desc    Rate a module
// @access  Private
router.post('/:id/rate', protect, async (req, res) => {
    try {
        const { rating } = req.body;

        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const module = await Module.findById(req.params.id);

        if (!module) {
            return res.status(404).json({
                success: false,
                message: 'Module not found'
            });
        }

        // Calculate new average
        const newRatingCount = module.ratingCount + 1;
        const newAverageRating = ((module.averageRating * module.ratingCount) + rating) / newRatingCount;

        module.ratingCount = newRatingCount;
        module.averageRating = Math.round(newAverageRating * 10) / 10;
        await module.save();

        res.json({
            success: true,
            data: {
                averageRating: module.averageRating,
                ratingCount: module.ratingCount
            }
        });
    } catch (error) {
        console.error('Rate module error:', error);
        res.status(500).json({
            success: false,
            message: 'Error rating module'
        });
    }
});

export default router;
