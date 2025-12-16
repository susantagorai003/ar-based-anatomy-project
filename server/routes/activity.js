import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/activity/log
// @desc    Log user activity
// @access  Private
router.post('/log', protect, async (req, res) => {
    try {
        const {
            action,
            anatomyModel,
            organ,
            quiz,
            module,
            sessionId,
            duration,
            metadata
        } = req.body;

        const activity = await ActivityLog.create({
            user: req.user._id,
            action,
            anatomyModel,
            organ,
            quiz,
            module,
            sessionId,
            duration,
            metadata
        });

        // Update user stats based on action
        const user = await User.findById(req.user._id);

        if (action === 'ar_interaction') {
            user.stats.arInteractions += 1;
        }
        if (duration && ['ar_session_end', 'module_complete'].includes(action)) {
            user.stats.totalStudyTime += Math.round(duration / 60); // Convert seconds to minutes
        }
        if (action === 'module_complete') {
            user.stats.modulesCompleted += 1;
        }

        await user.save();

        res.status(201).json({
            success: true,
            data: activity
        });
    } catch (error) {
        console.error('Log activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging activity'
        });
    }
});

// @route   GET /api/activity/me
// @desc    Get user's activity history
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const { action, page = 1, limit = 50 } = req.query;

        const query = { user: req.user._id };
        if (action) query.action = action;

        const total = await ActivityLog.countDocuments(query);
        const activities = await ActivityLog.find(query)
            .populate('anatomyModel', 'name slug thumbnail')
            .populate('organ', 'name slug')
            .populate('quiz', 'title slug')
            .populate('module', 'title slug')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: activities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching activity'
        });
    }
});

// @route   GET /api/activity/stats
// @desc    Get user's learning statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
    try {
        const { period = '7d' } = req.query;

        let startDate = new Date();
        switch (period) {
            case '7d':
                startDate.setDate(startDate.getDate() - 7);
                break;
            case '30d':
                startDate.setDate(startDate.getDate() - 30);
                break;
            case '90d':
                startDate.setDate(startDate.getDate() - 90);
                break;
            case 'all':
                startDate = new Date(0);
                break;
        }

        // Get activity breakdown
        const activityBreakdown = await ActivityLog.aggregate([
            {
                $match: {
                    user: req.user._id,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 },
                    totalDuration: { $sum: '$duration' }
                }
            }
        ]);

        // Get daily activity for chart
        const dailyActivity = await ActivityLog.aggregate([
            {
                $match: {
                    user: req.user._id,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
                    },
                    count: { $sum: 1 },
                    studyTime: { $sum: '$duration' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get most viewed organs/models
        const mostViewed = await ActivityLog.aggregate([
            {
                $match: {
                    user: req.user._id,
                    action: { $in: ['view_model', 'view_organ'] },
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { organ: '$organ', model: '$anatomyModel' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Get user stats
        const user = await User.findById(req.user._id).select('stats');

        res.json({
            success: true,
            data: {
                period,
                userStats: user.stats,
                activityBreakdown,
                dailyActivity,
                mostViewed
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

// @route   POST /api/activity/session/start
// @desc    Start a study session
// @access  Private
router.post('/session/start', protect, async (req, res) => {
    try {
        const { type, anatomyModel, organ, module } = req.body;

        const sessionId = `session_${req.user._id}_${Date.now()}`;

        const activity = await ActivityLog.create({
            user: req.user._id,
            action: type === 'ar' ? 'ar_session_start' : 'module_start',
            anatomyModel,
            organ,
            module,
            sessionId
        });

        res.json({
            success: true,
            data: {
                sessionId,
                activityId: activity._id,
                startedAt: activity.createdAt
            }
        });
    } catch (error) {
        console.error('Start session error:', error);
        res.status(500).json({
            success: false,
            message: 'Error starting session'
        });
    }
});

// @route   POST /api/activity/session/end
// @desc    End a study session
// @access  Private
router.post('/session/end', protect, async (req, res) => {
    try {
        const { sessionId, duration } = req.body;

        const startActivity = await ActivityLog.findOne({ sessionId });

        if (!startActivity) {
            return res.status(404).json({
                success: false,
                message: 'Session not found'
            });
        }

        const action = startActivity.action === 'ar_session_start'
            ? 'ar_session_end'
            : 'module_complete';

        const activity = await ActivityLog.create({
            user: req.user._id,
            action,
            anatomyModel: startActivity.anatomyModel,
            organ: startActivity.organ,
            module: startActivity.module,
            sessionId,
            duration
        });

        // Update user study time
        const user = await User.findById(req.user._id);
        user.stats.totalStudyTime += Math.round(duration / 60);
        await user.save();

        res.json({
            success: true,
            data: activity
        });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({
            success: false,
            message: 'Error ending session'
        });
    }
});

export default router;
