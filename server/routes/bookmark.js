import express from 'express';
import Bookmark from '../models/Bookmark.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/bookmarks
// @desc    Get user's bookmarks
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { folder, page = 1, limit = 20 } = req.query;

        const query = { user: req.user._id };
        if (folder) query.folder = folder;

        const total = await Bookmark.countDocuments(query);
        const bookmarks = await Bookmark.find(query)
            .populate('anatomyModel', 'name slug thumbnail system')
            .populate('organ', 'name slug system category')
            .sort({ isPinned: -1, createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: bookmarks,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching bookmarks'
        });
    }
});

// @route   GET /api/bookmarks/folders
// @desc    Get user's bookmark folders
// @access  Private
router.get('/folders', protect, async (req, res) => {
    try {
        const folders = await Bookmark.aggregate([
            { $match: { user: req.user._id } },
            { $group: { _id: '$folder', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: folders.map(f => ({ name: f._id, count: f.count }))
        });
    } catch (error) {
        console.error('Get folders error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching folders'
        });
    }
});

// @route   POST /api/bookmarks
// @desc    Create bookmark
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { anatomyModel, organ, folder, note, tags, color } = req.body;

        if (!anatomyModel && !organ) {
            return res.status(400).json({
                success: false,
                message: 'Must specify either anatomyModel or organ to bookmark'
            });
        }

        // Check if already bookmarked
        const existing = await Bookmark.findOne({
            user: req.user._id,
            ...(anatomyModel ? { anatomyModel } : { organ })
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Already bookmarked'
            });
        }

        const bookmark = await Bookmark.create({
            user: req.user._id,
            anatomyModel,
            organ,
            folder: folder || 'default',
            note,
            tags: tags || [],
            color
        });

        await bookmark.populate([
            { path: 'anatomyModel', select: 'name slug thumbnail system' },
            { path: 'organ', select: 'name slug system category' }
        ]);

        res.status(201).json({
            success: true,
            data: bookmark
        });
    } catch (error) {
        console.error('Create bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating bookmark',
            error: error.message
        });
    }
});

// @route   PUT /api/bookmarks/:id
// @desc    Update bookmark
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const bookmark = await Bookmark.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!bookmark) {
            return res.status(404).json({
                success: false,
                message: 'Bookmark not found'
            });
        }

        const { folder, note, tags, isPinned, color } = req.body;

        if (folder !== undefined) bookmark.folder = folder;
        if (note !== undefined) bookmark.note = note;
        if (tags !== undefined) bookmark.tags = tags;
        if (isPinned !== undefined) bookmark.isPinned = isPinned;
        if (color !== undefined) bookmark.color = color;

        await bookmark.save();
        await bookmark.populate([
            { path: 'anatomyModel', select: 'name slug thumbnail system' },
            { path: 'organ', select: 'name slug system category' }
        ]);

        res.json({
            success: true,
            data: bookmark
        });
    } catch (error) {
        console.error('Update bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating bookmark'
        });
    }
});

// @route   DELETE /api/bookmarks/:id
// @desc    Delete bookmark
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const bookmark = await Bookmark.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!bookmark) {
            return res.status(404).json({
                success: false,
                message: 'Bookmark not found'
            });
        }

        res.json({
            success: true,
            message: 'Bookmark deleted successfully'
        });
    } catch (error) {
        console.error('Delete bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting bookmark'
        });
    }
});

// @route   POST /api/bookmarks/toggle
// @desc    Toggle bookmark (add/remove)
// @access  Private
router.post('/toggle', protect, async (req, res) => {
    try {
        const { anatomyModel, organ } = req.body;

        const existing = await Bookmark.findOne({
            user: req.user._id,
            ...(anatomyModel ? { anatomyModel } : { organ })
        });

        if (existing) {
            await existing.deleteOne();
            return res.json({
                success: true,
                bookmarked: false,
                message: 'Bookmark removed'
            });
        }

        const bookmark = await Bookmark.create({
            user: req.user._id,
            anatomyModel,
            organ
        });

        res.json({
            success: true,
            bookmarked: true,
            data: bookmark
        });
    } catch (error) {
        console.error('Toggle bookmark error:', error);
        res.status(500).json({
            success: false,
            message: 'Error toggling bookmark'
        });
    }
});

export default router;
