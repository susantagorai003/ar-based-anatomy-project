import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBell, FiCheck, FiCheckCircle, FiTrash2, FiX, FiAward, FiHelpCircle, FiBookmark, FiEdit3 } from 'react-icons/fi';
import { notificationAPI } from '../../services/api';
import toast from 'react-hot-toast';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        fetchNotifications();

        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationAPI.getNotifications({ limit: 10 });
            if (response.data.success) {
                setNotifications(response.data.data);
                setUnreadCount(response.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await notificationAPI.markAsRead(id);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationAPI.markAllAsRead();
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
            toast.success('All notifications marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationAPI.delete(id);
            setNotifications(notifications.filter(n => n._id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'quiz_result':
                return <FiHelpCircle className="w-5 h-5 text-purple-500" />;
            case 'achievement':
                return <FiAward className="w-5 h-5 text-yellow-500" />;
            case 'bookmark':
                return <FiBookmark className="w-5 h-5 text-blue-500" />;
            case 'note':
                return <FiEdit3 className="w-5 h-5 text-green-500" />;
            default:
                return <FiBell className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatTime = (date) => {
        const now = new Date();
        const notifDate = new Date(date);
        const diff = now - notifDate;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return notifDate.toLocaleDateString();
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
            >
                <FiBell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-medium">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 glass-card overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-primary-500 hover:text-primary-600 flex items-center gap-1"
                                >
                                    <FiCheckCircle className="w-3 h-3" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* Notifications list */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-8 text-center text-gray-500">
                                    <FiBell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {notifications.map((notification) => (
                                        <div
                                            key={notification._id}
                                            className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notification.isRead ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    {notification.link ? (
                                                        <Link
                                                            to={notification.link}
                                                            onClick={() => {
                                                                setIsOpen(false);
                                                                if (!notification.isRead) {
                                                                    handleMarkAsRead(notification._id);
                                                                }
                                                            }}
                                                            className="block"
                                                        >
                                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                {notification.message}
                                                            </p>
                                                        </Link>
                                                    ) : (
                                                        <>
                                                            <p className="font-medium text-gray-900 dark:text-white truncate">
                                                                {notification.title}
                                                            </p>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                                {notification.message}
                                                            </p>
                                                        </>
                                                    )}
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-gray-400">
                                                            {formatTime(notification.createdAt)}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {!notification.isRead && (
                                                                <button
                                                                    onClick={() => handleMarkAsRead(notification._id)}
                                                                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                                                    title="Mark as read"
                                                                >
                                                                    <FiCheck className="w-3 h-3 text-gray-400" />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => handleDelete(notification._id)}
                                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 className="w-3 h-3 text-gray-400 hover:text-red-500" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationDropdown;
