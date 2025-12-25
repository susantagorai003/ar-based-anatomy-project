import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import {
    FiClock, FiBook, FiHelpCircle, FiBox, FiBookmark,
    FiTrendingUp, FiAward, FiEye, FiArrowRight, FiRefreshCw
} from 'react-icons/fi';
import { selectCurrentUser, fetchCurrentUser } from '../../store/slices/authSlice';
import { activityAPI } from '../../services/api';

const Dashboard = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectCurrentUser);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activityStats, setActivityStats] = useState(null);

    // Fetch activity stats on mount (user data is already fetched by App.jsx)
    useEffect(() => {
        fetchActivityStats();
    }, []);

    const fetchActivityStats = async () => {
        try {
            const response = await activityAPI.getStats({ period: '30d' });
            if (response.data?.success) {
                setActivityStats(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch activity stats:', error);
        }
    };

    const refreshData = async () => {
        setIsRefreshing(true);
        try {
            await fetchActivityStats();
        } finally {
            setIsRefreshing(false);
        }
    };

    const stats = [
        {
            label: 'Study Time',
            value: `${user?.stats?.totalStudyTime || 0}`,
            unit: 'mins',
            icon: FiClock,
            color: 'from-blue-500 to-cyan-500',
            change: '+12%'
        },
        {
            label: 'Modules Completed',
            value: user?.stats?.modulesCompleted || 0,
            icon: FiBook,
            color: 'from-green-500 to-emerald-500',
            change: '+2'
        },
        {
            label: 'Quizzes Taken',
            value: user?.stats?.quizzesTaken || 0,
            icon: FiHelpCircle,
            color: 'from-purple-500 to-pink-500',
            change: '+5'
        },
        {
            label: 'Average Score',
            value: `${Math.round(user?.stats?.averageScore || 0)}`,
            unit: '%',
            icon: FiAward,
            color: 'from-yellow-500 to-orange-500',
            change: '+8%'
        },
    ];

    const quickActions = [
        { label: 'Continue Learning', icon: FiBook, path: '/library', color: 'bg-primary-500' },
        { label: 'Take a Quiz', icon: FiHelpCircle, path: '/quizzes', color: 'bg-green-500' },
        { label: 'View in AR', icon: FiBox, path: '/library', color: 'bg-purple-500' },
        { label: 'My Bookmarks', icon: FiBookmark, path: '/bookmarks', color: 'bg-orange-500' },
    ];

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Welcome header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-display font-bold text-gray-900 dark:text-white"
                        >
                            Welcome back, {user?.firstName}! 👋
                        </motion.h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">
                            Here's your learning progress
                        </p>
                    </div>
                    <button
                        onClick={refreshData}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                    >
                        <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                                    <stat.icon className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stat.value}
                                </span>
                                {stat.unit && (
                                    <span className="text-sm text-gray-500">{stat.unit}</span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-6"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                Quick Actions
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {quickActions.map((action) => (
                                    <Link
                                        key={action.label}
                                        to={action.path}
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                            <action.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                                            {action.label}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>

                        {/* Recently viewed */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Recently Viewed
                                </h2>
                                <Link to="/library" className="text-sm text-primary-500 hover:text-primary-600">
                                    View all
                                </Link>
                            </div>
                            {user?.recentlyViewed?.length > 0 ? (
                                <div className="space-y-3">
                                    {user.recentlyViewed.slice(0, 5).map((item, index) => (
                                        <Link
                                            key={item.model?._id || index}
                                            to={`/viewer/${item.model?.slug}`}
                                            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                                                {item.model?.thumbnail ? (
                                                    <img src={item.model.thumbnail} alt="" className="w-full h-full object-cover rounded-lg" />
                                                ) : (
                                                    <FiBox className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {item.model?.name || 'Unknown Model'}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Viewed {new Date(item.viewedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <FiEye className="w-4 h-4 text-gray-400" />
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <FiEye className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                    <p className="text-gray-500">No recently viewed items</p>
                                    <Link to="/library" className="btn-primary mt-4">
                                        Start Exploring
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Progress card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiTrendingUp className="w-5 h-5 text-primary-500" />
                                Learning Progress
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">Models Viewed</span>
                                        <span className="font-medium">{user?.stats?.modelsViewed || 0}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${Math.min((user?.stats?.modelsViewed || 0) / 50 * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-600 dark:text-gray-400">AR Interactions</span>
                                        <span className="font-medium">{user?.stats?.arInteractions || 0}</span>
                                    </div>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${Math.min((user?.stats?.arInteractions || 0) / 100 * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Achievements */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-6"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiAward className="w-5 h-5 text-yellow-500" />
                                Achievements
                            </h3>
                            <div className="grid grid-cols-4 gap-2">
                                {['🎯', '📚', '🧠', '🏆', '⭐', '🔥', '💎', '🎓'].map((emoji, i) => (
                                    <div
                                        key={i}
                                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${i < 3 ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-gray-100 dark:bg-gray-700 opacity-40'
                                            }`}
                                    >
                                        {emoji}
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm text-gray-500 mt-4 text-center">
                                3 of 8 achievements unlocked
                            </p>
                        </motion.div>

                        {/* Study tip */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="p-6 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 text-white"
                        >
                            <h3 className="font-semibold mb-2">💡 Study Tip</h3>
                            <p className="text-sm text-white/90 mb-4">
                                Use AR mode to visualize organs in real space. Studies show 3D learning improves retention by 40%!
                            </p>
                            <Link
                                to="/library"
                                className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all"
                            >
                                Try AR Now
                                <FiArrowRight className="w-4 h-4" />
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
