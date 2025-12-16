import express from 'express';
import User from '../models/User.js';
import AnatomyModel from '../models/AnatomyModel.js';
import Organ from '../models/Organ.js';
import Quiz from '../models/Quiz.js';
import QuizAttempt from '../models/QuizAttempt.js';
import Module from '../models/Module.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, adminOnly);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // Get counts
        const [
            totalUsers,
            activeUsers,
            newUsersToday,
            totalModels,
            totalOrgans,
            totalQuizzes,
            totalAttempts
        ] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'student', lastLogin: { $gte: thirtyDaysAgo } }),
            User.countDocuments({ role: 'student', createdAt: { $gte: today } }),
            AnatomyModel.countDocuments({ isActive: true }),
            Organ.countDocuments({ isActive: true }),
            Quiz.countDocuments({ isActive: true }),
            QuizAttempt.countDocuments()
        ]);

        // Get recent signups
        const recentSignups = await User.find({ role: 'student' })
            .select('firstName lastName email createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // Get quiz performance stats
        const quizStats = await QuizAttempt.aggregate([
            {
                $group: {
                    _id: null,
                    avgScore: { $avg: '$percentage' },
                    totalAttempts: { $sum: 1 },
                    passRate: {
                        $avg: { $cond: ['$passed', 1, 0] }
                    }
                }
            }
        ]);

        // Get daily activity for last 30 days
        const dailyActivity = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Get most viewed organs
        const topOrgans = await ActivityLog.aggregate([
            {
                $match: {
                    action: 'view_organ',
                    organ: { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$organ',
                    views: { $sum: 1 }
                }
            },
            { $sort: { views: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: 'organs',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'organ'
                }
            },
            { $unwind: '$organ' },
            {
                $project: {
                    _id: 1,
                    views: 1,
                    name: '$organ.name',
                    system: '$organ.system'
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                stats: {
                    totalUsers,
                    activeUsers,
                    newUsersToday,
                    totalModels,
                    totalOrgans,
                    totalQuizzes,
                    totalAttempts
                },
                quizStats: quizStats[0] || { avgScore: 0, totalAttempts: 0, passRate: 0 },
                recentSignups,
                dailyActivity,
                topOrgans
            }
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const { role, search, page = 1, limit = 20 } = req.query;

        const query = {};
        if (role) query.role = role;
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json({
            success: true,
            data: users,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users'
        });
    }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user (role, status)
// @access  Private/Admin
router.put('/users/:id', async (req, res) => {
    try {
        const { role, isActive } = req.body;

        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (role) user.role = role;
        if (typeof isActive === 'boolean') user.isActive = isActive;

        await user.save();

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user'
        });
    }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete/deactivate user
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            message: 'User deactivated successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
});

// @route   GET /api/admin/analytics/engagement
// @desc    Get engagement analytics
// @access  Private/Admin
router.get('/analytics/engagement', async (req, res) => {
    try {
        const { period = '30d' } = req.query;

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
        }

        // Sessions by type
        const sessionsByType = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    action: { $in: ['ar_session_start', 'module_start', 'quiz_start'] }
                }
            },
            {
                $group: {
                    _id: '$action',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Average session duration
        const avgDuration = await ActivityLog.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    action: { $in: ['ar_session_end', 'module_complete'] },
                    duration: { $exists: true, $gt: 0 }
                }
            },
            {
                $group: {
                    _id: null,
                    avgDuration: { $avg: '$duration' },
                    totalTime: { $sum: '$duration' }
                }
            }
        ]);

        // Peak usage hours
        const peakHours = await ActivityLog.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $group: {
                    _id: { $hour: '$createdAt' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        res.json({
            success: true,
            data: {
                period,
                sessionsByType,
                avgDuration: avgDuration[0] || { avgDuration: 0, totalTime: 0 },
                peakHours
            }
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics'
        });
    }
});

// @route   GET /api/admin/analytics/quiz-performance
// @desc    Get quiz performance analytics
// @access  Private/Admin
router.get('/analytics/quiz-performance', async (req, res) => {
    try {
        const { period = '30d' } = req.query;

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
        }

        // Quiz performance by quiz
        const quizPerformance = await QuizAttempt.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $group: {
                    _id: '$quiz',
                    attempts: { $sum: 1 },
                    avgScore: { $avg: '$percentage' },
                    passRate: { $avg: { $cond: ['$passed', 1, 0] } }
                }
            },
            {
                $lookup: {
                    from: 'quizzes',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'quiz'
                }
            },
            { $unwind: '$quiz' },
            {
                $project: {
                    _id: 1,
                    title: '$quiz.title',
                    attempts: 1,
                    avgScore: { $round: ['$avgScore', 1] },
                    passRate: { $round: [{ $multiply: ['$passRate', 100] }, 1] }
                }
            },
            { $sort: { attempts: -1 } }
        ]);

        // Daily attempts trend
        const dailyAttempts = await QuizAttempt.aggregate([
            {
                $match: { createdAt: { $gte: startDate } }
            },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                    count: { $sum: 1 },
                    avgScore: { $avg: '$percentage' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            success: true,
            data: {
                period,
                quizPerformance,
                dailyAttempts
            }
        });
    } catch (error) {
        console.error('Quiz analytics error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching quiz analytics'
        });
    }
});

export default router;
