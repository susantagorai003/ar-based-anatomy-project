import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FiUsers, FiBox, FiHelpCircle, FiEye, FiTrendingUp,
    FiClock, FiBarChart2, FiArrowRight
} from 'react-icons/fi';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await adminAPI.getDashboard();
            setData(response.data.data);
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    const stats = [
        { label: 'Total Users', value: data?.totalUsers || 0, icon: FiUsers, color: 'from-blue-500 to-cyan-500', change: '+12%' },
        { label: 'Active Today', value: data?.activeToday || 0, icon: FiTrendingUp, color: 'from-green-500 to-emerald-500', change: '+8%' },
        { label: 'Total Models', value: data?.totalModels || 0, icon: FiBox, color: 'from-purple-500 to-pink-500' },
        { label: 'Total Quizzes', value: data?.totalQuizzes || 0, icon: FiHelpCircle, color: 'from-orange-500 to-red-500' },
    ];

    // Sample chart data
    const chartData = data?.weeklyActivity || [
        { name: 'Mon', views: 120, quizzes: 45 },
        { name: 'Tue', views: 180, quizzes: 62 },
        { name: 'Wed', views: 150, quizzes: 55 },
        { name: 'Thu', views: 220, quizzes: 78 },
        { name: 'Fri', views: 190, quizzes: 65 },
        { name: 'Sat', views: 140, quizzes: 40 },
        { name: 'Sun', views: 100, quizzes: 35 },
    ];

    return (
        <div>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">
                    Admin Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                    Overview of platform activity and management
                </p>
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
                            {stat.change && (
                                <span className="text-xs text-green-500 font-medium">{stat.change}</span>
                            )}
                        </div>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                            {stat.value.toLocaleString()}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Charts */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Activity chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Weekly Activity
                        </h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} />
                                    <YAxis stroke="#9CA3AF" fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#1F2937',
                                            border: 'none',
                                            borderRadius: '12px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Line type="monotone" dataKey="views" stroke="#6366F1" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="quizzes" stroke="#22D3EE" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-primary-500" />
                                <span className="text-sm text-gray-500">Model Views</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-cyan-500" />
                                <span className="text-sm text-gray-500">Quiz Attempts</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Most viewed models */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Most Viewed Models
                            </h2>
                            <Link to="/admin/models" className="text-sm text-primary-500 hover:text-primary-600">
                                View All
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {(data?.topModels || [
                                { name: 'Human Heart', views: 1234, system: 'Circulatory' },
                                { name: 'Human Brain', views: 987, system: 'Nervous' },
                                { name: 'Full Skeleton', views: 876, system: 'Skeletal' },
                                { name: 'Lungs', views: 654, system: 'Respiratory' },
                            ]).map((model, index) => (
                                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                    <span className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-sm font-semibold">
                                        {index + 1}
                                    </span>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900 dark:text-white">{model.name}</p>
                                        <p className="text-xs text-gray-500">{model.system}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                        <FiEye className="w-4 h-4" />
                                        {model.views.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick actions */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-6"
                    >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Quick Actions
                        </h3>
                        <div className="space-y-2">
                            {[
                                { label: 'Add New Model', path: '/admin/models', icon: FiBox },
                                { label: 'Create Quiz', path: '/admin/quizzes', icon: FiHelpCircle },
                                { label: 'Manage Users', path: '/admin/users', icon: FiUsers },
                                { label: 'View Analytics', path: '/admin', icon: FiBarChart2 },
                            ].map((action) => (
                                <Link
                                    key={action.label}
                                    to={action.path}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                                >
                                    <action.icon className="w-5 h-5 text-gray-400 group-hover:text-primary-500" />
                                    <span className="flex-1 text-gray-700 dark:text-gray-300">{action.label}</span>
                                    <FiArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recent activity */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass-card p-6"
                    >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                            Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {(data?.recentActivity || [
                                { type: 'user', message: 'New user registered', time: '2 min ago' },
                                { type: 'quiz', message: 'Quiz completed by John D.', time: '15 min ago' },
                                { type: 'view', message: 'Heart model viewed 50 times', time: '1 hr ago' },
                                { type: 'user', message: '5 new users today', time: '2 hrs ago' },
                            ]).map((activity, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary-500 mt-2" />
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">{activity.message}</p>
                                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                            <FiClock className="w-3 h-3" />
                                            {activity.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* System status */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="p-6 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 text-white"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-3 h-3 rounded-full bg-white animate-pulse" />
                            <span className="font-semibold">System Status</span>
                        </div>
                        <p className="text-white/90 text-sm">
                            All systems operational. Server response time: 45ms
                        </p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
