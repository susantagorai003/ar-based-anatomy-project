import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/notifications
// @desc    Get user's notifications
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const { page = 1, limit = 20, unreadOnly } = req.query;

        const query = { user: req.user._id };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const total = await Notification.countDocuments(query);
        const unreadCount = await Notification.countDocuments({
            user: req.user._id,
            isRead: false
        });

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            data: notification
        });
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notification'
        });
    }
});

// @route   PUT /api/notifications/read-all
// @desc    Mark all notifications as read
// @access  Private
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating notifications'
        });
    }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        res.json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification'
        });
    }
});

// @route   DELETE /api/notifications
// @desc    Delete all notifications
// @access  Private
router.delete('/', protect, async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user._id });

        res.json({
            success: true,
            message: 'All notifications deleted'
        });
    } catch (error) {
        console.error('Delete all notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notifications'
        });
    }
});

// Helper function to create notification (for use in other routes)
export const createNotification = async (userId, { type, title, message, link, icon, metadata }) => {
    try {
        const notification = await Notification.create({
            user: userId,
            type,
            title,
            message,
            link: link || '',
            icon: icon || '',
            metadata: metadata || {}
        });
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

export default router;
