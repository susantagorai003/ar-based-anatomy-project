import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FiHome, FiGrid, FiBox, FiHelpCircle, FiBookmark,
    FiEdit3, FiPieChart, FiLayers, FiX
} from 'react-icons/fi';
import { selectSidebarOpen, toggleSidebar, selectTheme } from '../../store/slices/uiSlice';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const Sidebar = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const sidebarOpen = useSelector(selectSidebarOpen);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const mainMenuItems = [
        { path: '/', label: 'Home', icon: FiHome },
        { path: '/library', label: 'Anatomy Library', icon: FiGrid },
        { path: '/quizzes', label: 'Quizzes', icon: FiHelpCircle },
    ];

    const studentMenuItems = [
        { path: '/dashboard', label: 'My Dashboard', icon: FiPieChart },
        { path: '/bookmarks', label: 'Bookmarks', icon: FiBookmark },
        { path: '/notes', label: 'Notes', icon: FiEdit3 },
    ];

    const systemColors = {
        skeletal: 'bg-gray-200',
        muscular: 'bg-red-500',
        organs: 'bg-red-600',
        circulatory: 'bg-red-700',
        nervous: 'bg-yellow-400',
        respiratory: 'bg-blue-400',
        digestive: 'bg-amber-500',
        urinary: 'bg-purple-400',
        endocrine: 'bg-green-500',
        lymphatic: 'bg-violet-500',
    };

    const systems = [
        { id: 'skeletal', name: 'Skeletal', color: systemColors.skeletal },
        { id: 'muscular', name: 'Muscular', color: systemColors.muscular },
        { id: 'circulatory', name: 'Circulatory', color: systemColors.circulatory },
        { id: 'nervous', name: 'Nervous', color: systemColors.nervous },
        { id: 'respiratory', name: 'Respiratory', color: systemColors.respiratory },
        { id: 'digestive', name: 'Digestive', color: systemColors.digestive },
    ];

    return (
        <>
            {/* Mobile backdrop */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => dispatch(toggleSidebar())}
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="sidebar z-50 lg:z-30"
                    >
                        {/* Close button (mobile) */}
                        <button
                            onClick={() => dispatch(toggleSidebar())}
                            className="lg:hidden absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <FiX className="w-5 h-5" />
                        </button>

                        <div className="p-4 pt-6 space-y-6 h-full overflow-y-auto scrollbar-custom">
                            {/* Main Navigation */}
                            <div>
                                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                    Navigation
                                </h3>
                                <nav className="space-y-1">
                                    {mainMenuItems.map((item) => {
                                        const isActive = location.pathname === item.path;
                                        const Icon = item.icon;

                                        return (
                                            <Link
                                                key={item.path}
                                                to={item.path}
                                                onClick={() => window.innerWidth < 1024 && dispatch(toggleSidebar())}
                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                                        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        );
                                    })}
                                </nav>
                            </div>

                            {/* Student Section */}
                            {isAuthenticated && (
                                <div>
                                    <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                        My Learning
                                    </h3>
                                    <nav className="space-y-1">
                                        {studentMenuItems.map((item) => {
                                            const isActive = location.pathname === item.path;
                                            const Icon = item.icon;

                                            return (
                                                <Link
                                                    key={item.path}
                                                    to={item.path}
                                                    onClick={() => window.innerWidth < 1024 && dispatch(toggleSidebar())}
                                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                                            ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                        }`}
                                                >
                                                    <Icon className="w-5 h-5" />
                                                    <span className="font-medium">{item.label}</span>
                                                </Link>
                                            );
                                        })}
                                    </nav>
                                </div>
                            )}

                            {/* Body Systems */}
                            <div>
                                <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FiLayers className="w-4 h-4" />
                                    Body Systems
                                </h3>
                                <nav className="space-y-1">
                                    {systems.map((system) => (
                                        <Link
                                            key={system.id}
                                            to={`/library?system=${system.id}`}
                                            onClick={() => window.innerWidth < 1024 && dispatch(toggleSidebar())}
                                            className="flex items-center gap-3 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <div className={`w-3 h-3 rounded-full ${system.color}`} />
                                            <span className="text-sm">{system.name}</span>
                                        </Link>
                                    ))}
                                </nav>
                            </div>

                            {/* AR Feature Highlight */}
                            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-200 dark:border-primary-800">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                        <FiBox className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">AR Mode</h4>
                                        <p className="text-xs text-gray-500">View in real world</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    Place 3D anatomy models in your environment using AR.
                                </p>
                                <Link
                                    to="/library"
                                    className="block w-full text-center py-2 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                                >
                                    Explore Models
                                </Link>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
