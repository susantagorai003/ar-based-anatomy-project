import express from 'express';
import AnatomyModel from '../models/AnatomyModel.js';
import Organ from '../models/Organ.js';
import User from '../models/User.js';
import { protect, optionalAuth, adminOnly } from '../middleware/auth.js';
import { uploadModelWithThumbnail } from '../middleware/upload.js';

const router = express.Router();

// @route   GET /api/anatomy/models
// @desc    Get all anatomy models with filters
// @access  Public
router.get('/models', optionalAuth, async (req, res) => {
    try {
        const { system, category, difficulty, search, page = 1, limit = 20 } = req.query;

        const query = { isActive: true };

        if (system) query.system = system;
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$text = { $search: search };
        }

        const total = await AnatomyModel.countDocuments(query);
        const models = await AnatomyModel.find(query)
            .select('name slug description system category thumbnail difficulty viewCount tags')
            .sort({ viewCount: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: models,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get models error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching anatomy models'
        });
    }
});

// @route   GET /api/anatomy/models/:slug
// @desc    Get single anatomy model by slug
// @access  Public
router.get('/models/:slug', optionalAuth, async (req, res) => {
    try {
        const model = await AnatomyModel.findOne({ slug: req.params.slug, isActive: true })
            .populate('hotspots.linkedOrgan', 'name slug description function');

        if (!model) {
            return res.status(404).json({
                success: false,
                message: 'Model not found'
            });
        }

        // Increment view count
        model.viewCount += 1;
        await model.save();

        // Add to user's recently viewed if authenticated
        if (req.user) {
            const user = await User.findById(req.user._id);

            // Remove if already in recent, then add to front
            user.recentlyViewed = user.recentlyViewed.filter(
                rv => rv.model.toString() !== model._id.toString()
            );
            user.recentlyViewed.unshift({ model: model._id, viewedAt: new Date() });

            // Keep only last 20
            user.recentlyViewed = user.recentlyViewed.slice(0, 20);
            user.stats.modelsViewed += 1;
            await user.save();
        }

        res.json({
            success: true,
            data: model
        });
    } catch (error) {
        console.error('Get model error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching anatomy model'
        });
    }
});

// @route   GET /api/anatomy/organs
// @desc    Get all organs with filters
// @access  Public
router.get('/organs', async (req, res) => {
    try {
        const { system, category, difficulty, search, page = 1, limit = 50 } = req.query;

        const query = { isActive: true };

        if (system) query.system = system;
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$text = { $search: search };
        }

        const total = await Organ.countDocuments(query);
        const organs = await Organ.find(query)
            .select('name slug latinName system category description function difficulty tags')
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: organs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get organs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organs'
        });
    }
});

// @route   GET /api/anatomy/organs/:slug
// @desc    Get single organ by slug
// @access  Public
router.get('/organs/:slug', optionalAuth, async (req, res) => {
    try {
        const organ = await Organ.findOne({ slug: req.params.slug, isActive: true })
            .populate('connectedOrgans.organ', 'name slug')
            .populate('model', 'name slug modelFile thumbnail');

        if (!organ) {
            return res.status(404).json({
                success: false,
                message: 'Organ not found'
            });
        }

        // Increment view count
        organ.viewCount += 1;
        await organ.save();

        res.json({
            success: true,
            data: organ
        });
    } catch (error) {
        console.error('Get organ error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organ'
        });
    }
});

// @route   GET /api/anatomy/systems
// @desc    Get all body systems with counts
// @access  Public
router.get('/systems', async (req, res) => {
    try {
        const systems = await Organ.aggregate([
            { $match: { isActive: true } },
            { $group: { _id: '$system', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        const systemsData = [
            { id: 'skeletal', name: 'Skeletal System', icon: '🦴', color: '#F3F4F6' },
            { id: 'muscular', name: 'Muscular System', icon: '💪', color: '#EF4444' },
            { id: 'organs', name: 'Major Organs', icon: '🫀', color: '#DC2626' },
            { id: 'circulatory', name: 'Circulatory System', icon: '❤️', color: '#B91C1C' },
            { id: 'nervous', name: 'Nervous System', icon: '🧠', color: '#FBBF24' },
            { id: 'respiratory', name: 'Respiratory System', icon: '🫁', color: '#60A5FA' },
            { id: 'digestive', name: 'Digestive System', icon: '🍽️', color: '#F59E0B' },
            { id: 'urinary', name: 'Urinary System', icon: '🫘', color: '#A78BFA' },
            { id: 'reproductive-male', name: 'Male Reproductive', icon: '♂️', color: '#3B82F6' },
            { id: 'reproductive-female', name: 'Female Reproductive', icon: '♀️', color: '#EC4899' },
            { id: 'endocrine', name: 'Endocrine System', icon: '⚗️', color: '#10B981' },
            { id: 'lymphatic', name: 'Lymphatic/Immune', icon: '🛡️', color: '#8B5CF6' },
            { id: 'integumentary', name: 'Integumentary', icon: '🧬', color: '#F97316' },
            { id: 'special-senses', name: 'Special Senses', icon: '👁️', color: '#06B6D4' }
        ];

        // Merge with counts
        const result = systemsData.map(s => {
            const found = systems.find(sys => sys._id === s.id);
            return { ...s, count: found ? found.count : 0 };
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Get systems error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching systems'
        });
    }
});

// @route   GET /api/anatomy/search
// @desc    Search organs and models (for autocomplete)
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { q, limit = 10 } = req.query;

        if (!q || q.length < 2) {
            return res.json({
                success: true,
                data: { organs: [], models: [] }
            });
        }

        const regex = new RegExp(q, 'i');

        const [organs, models] = await Promise.all([
            Organ.find({
                isActive: true,
                $or: [
                    { name: regex },
                    { latinName: regex },
                    { tags: regex }
                ]
            })
                .select('name slug system latinName')
                .limit(parseInt(limit)),

            AnatomyModel.find({
                isActive: true,
                $or: [
                    { name: regex },
                    { tags: regex }
                ]
            })
                .select('name slug system thumbnail')
                .limit(parseInt(limit))
        ]);

        res.json({
            success: true,
            data: { organs, models }
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            success: false,
            message: 'Error searching'
        });
    }
});

// @route   POST /api/anatomy/models
// @desc    Upload new anatomy model (admin only)
// @access  Private/Admin
router.post('/models', protect, adminOnly,
    uploadModelWithThumbnail.fields([
        { name: 'model', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    async (req, res) => {
        try {
            const {
                name, description, system, category, subcategory,
                scale, positionX, positionY, positionZ,
                rotationX, rotationY, rotationZ,
                difficulty, tags, isARCompatible
            } = req.body;

            if (!req.files.model) {
                return res.status(400).json({
                    success: false,
                    message: '3D model file is required'
                });
            }

            const modelFile = `/uploads/models/${req.files.model[0].filename}`;
            const thumbnail = req.files.thumbnail
                ? `/uploads/thumbnails/${req.files.thumbnail[0].filename}`
                : null;

            const model = await AnatomyModel.create({
                name,
                description,
                system,
                category,
                subcategory,
                modelFile,
                modelFormat: req.files.model[0].filename.endsWith('.gltf') ? 'gltf' : 'glb',
                thumbnail,
                scale: scale || 1,
                position: {
                    x: positionX || 0,
                    y: positionY || 0,
                    z: positionZ || 0
                },
                rotation: {
                    x: rotationX || 0,
                    y: rotationY || 0,
                    z: rotationZ || 0
                },
                difficulty: difficulty || 'beginner',
                tags: tags ? tags.split(',').map(t => t.trim()) : [],
                isARCompatible: isARCompatible !== 'false',
                fileSize: req.files.model[0].size,
                uploadedBy: req.user._id
            });

            res.status(201).json({
                success: true,
                data: model
            });
        } catch (error) {
            console.error('Upload model error:', error);
            res.status(500).json({
                success: false,
                message: 'Error uploading model',
                error: error.message
            });
        }
    }
);

// @route   PUT /api/anatomy/models/:id
// @desc    Update anatomy model (admin only)
// @access  Private/Admin
router.put('/models/:id', protect, adminOnly, async (req, res) => {
    try {
        const model = await AnatomyModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!model) {
            return res.status(404).json({
                success: false,
                message: 'Model not found'
            });
        }

        res.json({
            success: true,
            data: model
        });
    } catch (error) {
        console.error('Update model error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating model'
        });
    }
});

// @route   DELETE /api/anatomy/models/:id
// @desc    Delete anatomy model (admin only)
// @access  Private/Admin
router.delete('/models/:id', protect, adminOnly, async (req, res) => {
    try {
        const model = await AnatomyModel.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!model) {
            return res.status(404).json({
                success: false,
                message: 'Model not found'
            });
        }

        res.json({
            success: true,
            message: 'Model deleted successfully'
        });
    } catch (error) {
        console.error('Delete model error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting model'
        });
    }
});

export default router;
