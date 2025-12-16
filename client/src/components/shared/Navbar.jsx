import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiSearch, FiMenu, FiMoon, FiSun, FiBell, FiLogOut,
    FiUser, FiSettings, FiBookmark, FiEdit3
} from 'react-icons/fi';
import { selectCurrentUser, selectIsAuthenticated, logout } from '../../store/slices/authSlice';
import { selectTheme, toggleTheme, toggleSidebar, openModal } from '../../store/slices/uiSlice';
import SearchModal from '../modals/SearchModal';

const Navbar = () => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector(selectCurrentUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const theme = useSelector(selectTheme);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    return (
        <>
            <nav className="navbar h-16">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex items-center justify-between h-full">
                        {/* Left section */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => dispatch(toggleSidebar())}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <FiMenu className="w-6 h-6" />
                            </button>

                            <Link to="/" className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <span className="hidden sm:block font-display font-bold text-xl text-gray-900 dark:text-white">
                                    Anatomy<span className="text-primary-500">AR</span>
                                </span>
                            </Link>
                        </div>

                        {/* Center - Search */}
                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <button
                                onClick={() => setShowSearch(true)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <FiSearch className="w-5 h-5" />
                                <span>Search anatomy, organs, systems...</span>
                                <kbd className="ml-auto hidden lg:inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-gray-700 rounded text-xs text-gray-500 border border-gray-200 dark:border-gray-600">
                                    ⌘K
                                </kbd>
                            </button>
                        </div>

                        {/* Right section */}
                        <div className="flex items-center gap-2">
                            {/* Mobile search */}
                            <button
                                onClick={() => setShowSearch(true)}
                                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <FiSearch className="w-5 h-5" />
                            </button>

                            {/* Theme toggle */}
                            <button
                                onClick={() => dispatch(toggleTheme())}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                {theme === 'dark' ? (
                                    <FiSun className="w-5 h-5 text-yellow-500" />
                                ) : (
                                    <FiMoon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                                )}
                            </button>

                            {isAuthenticated ? (
                                <>
                                    {/* Notifications */}
                                    <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative">
                                        <FiBell className="w-5 h-5" />
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                                    </button>

                                    {/* User menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setShowUserMenu(!showUserMenu)}
                                            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-semibold text-sm">
                                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                                            </div>
                                        </button>

                                        <AnimatePresence>
                                            {showUserMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                    transition={{ duration: 0.15 }}
                                                    className="absolute right-0 mt-2 w-64 glass-card p-2 z-50"
                                                >
                                                    <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 mb-2">
                                                        <p className="font-medium text-gray-900 dark:text-white">
                                                            {user?.firstName} {user?.lastName}
                                                        </p>
                                                        <p className="text-sm text-gray-500">{user?.email}</p>
                                                    </div>

                                                    <Link
                                                        to="/dashboard"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <FiUser className="w-4 h-4" />
                                                        <span>Dashboard</span>
                                                    </Link>
                                                    <Link
                                                        to="/bookmarks"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <FiBookmark className="w-4 h-4" />
                                                        <span>Bookmarks</span>
                                                    </Link>
                                                    <Link
                                                        to="/notes"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <FiEdit3 className="w-4 h-4" />
                                                        <span>Notes</span>
                                                    </Link>
                                                    <Link
                                                        to="/settings"
                                                        onClick={() => setShowUserMenu(false)}
                                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <FiSettings className="w-4 h-4" />
                                                        <span>Settings</span>
                                                    </Link>

                                                    {user?.role === 'admin' && (
                                                        <Link
                                                            to="/admin"
                                                            onClick={() => setShowUserMenu(false)}
                                                            className="flex items-center gap-3 px-3 py-2 rounded-lg text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                                                        >
                                                            <FiSettings className="w-4 h-4" />
                                                            <span>Admin Panel</span>
                                                        </Link>
                                                    )}

                                                    <hr className="my-2 border-gray-200 dark:border-gray-700" />

                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                                    >
                                                        <FiLogOut className="w-4 h-4" />
                                                        <span>Logout</span>
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link to="/login" className="btn-ghost">
                                        Sign In
                                    </Link>
                                    <Link to="/register" className="btn-primary !py-2 !px-4">
                                        Get Started
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Search Modal */}
            <SearchModal isOpen={showSearch} onClose={() => setShowSearch(false)} />
        </>
    );
};

export default Navbar;
