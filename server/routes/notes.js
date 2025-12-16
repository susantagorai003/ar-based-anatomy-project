import express from 'express';
import Note from '../models/Note.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notes
// @desc    Get user's notes
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { folder, organ, search, page = 1, limit = 20 } = req.query;

        const query = { user: req.user._id };
        if (folder) query.folder = folder;
        if (organ) query.organ = organ;
        if (search) {
            query.$text = { $search: search };
        }

        const total = await Note.countDocuments(query);
        const notes = await Note.find(query)
            .populate('organ', 'name slug')
            .populate('anatomyModel', 'name slug')
            .populate('quiz', 'title slug')
            .populate('module', 'title slug')
            .sort({ isPinned: -1, updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: notes,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notes'
        });
    }
});

// @route   GET /api/notes/folders
// @desc    Get user's note folders
// @access  Private
router.get('/folders', protect, async (req, res) => {
    try {
        const folders = await Note.aggregate([
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

// @route   GET /api/notes/:id
// @desc    Get single note
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id
        })
            .populate('organ', 'name slug system')
            .populate('anatomyModel', 'name slug')
            .populate('quiz', 'title slug')
            .populate('module', 'title slug');

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        console.error('Get note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching note'
        });
    }
});

// @route   POST /api/notes
// @desc    Create note
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, content, contentType, organ, anatomyModel, quiz, module, folder, tags, color } = req.body;

        const note = await Note.create({
            user: req.user._id,
            title,
            content,
            contentType: contentType || 'markdown',
            organ,
            anatomyModel,
            quiz,
            module,
            folder: folder || 'general',
            tags: tags || [],
            color
        });

        await note.populate([
            { path: 'organ', select: 'name slug' },
            { path: 'anatomyModel', select: 'name slug' },
            { path: 'quiz', select: 'title slug' },
            { path: 'module', select: 'title slug' }
        ]);

        res.status(201).json({
            success: true,
            data: note
        });
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating note',
            error: error.message
        });
    }
});

// @route   PUT /api/notes/:id
// @desc    Update note
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        const { title, content, contentType, folder, tags, isPinned, color } = req.body;

        // Save revision if content changed
        if (content && content !== note.content) {
            note.revisions.push({
                content: note.content,
                editedAt: new Date()
            });
            // Keep only last 10 revisions
            note.revisions = note.revisions.slice(-10);
        }

        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;
        if (contentType !== undefined) note.contentType = contentType;
        if (folder !== undefined) note.folder = folder;
        if (tags !== undefined) note.tags = tags;
        if (isPinned !== undefined) note.isPinned = isPinned;
        if (color !== undefined) note.color = color;

        await note.save();
        await note.populate([
            { path: 'organ', select: 'name slug' },
            { path: 'anatomyModel', select: 'name slug' },
            { path: 'quiz', select: 'title slug' },
            { path: 'module', select: 'title slug' }
        ]);

        res.json({
            success: true,
            data: note
        });
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating note'
        });
    }
});

// @route   DELETE /api/notes/:id
// @desc    Delete note
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!note) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting note'
        });
    }
});

// @route   GET /api/notes/organ/:organId
// @desc    Get notes for specific organ
// @access  Private
router.get('/organ/:organId', protect, async (req, res) => {
    try {
        const notes = await Note.find({
            user: req.user._id,
            organ: req.params.organId
        }).sort({ updatedAt: -1 });

        res.json({
            success: true,
            data: notes
        });
    } catch (error) {
        console.error('Get organ notes error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notes'
        });
    }
});

export default router;
