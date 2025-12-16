import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    FiArrowLeft, FiBox, FiBookmark, FiEdit3, FiExternalLink,
    FiAlertCircle, FiInfo, FiHeart, FiZap
} from 'react-icons/fi';
import { fetchOrganBySlug, selectCurrentOrgan, selectAnatomyLoading, toggleBookmark } from '../store/slices/anatomySlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const OrganDetail = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const organ = useSelector(selectCurrentOrgan);
    const isLoading = useSelector(selectAnatomyLoading);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    useEffect(() => {
        dispatch(fetchOrganBySlug(slug));
    }, [dispatch, slug]);

    const handleBookmark = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to bookmark');
            return;
        }
        try {
            await dispatch(toggleBookmark({ organ: organ._id })).unwrap();
            toast.success('Bookmark updated!');
        } catch (err) {
            toast.error('Failed to update bookmark');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!organ) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FiInfo className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Organ not found
                    </h2>
                    <Link to="/library" className="btn-primary">
                        Back to Library
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-10">
            {/* Header */}
            <div className="bg-gradient-to-br from-primary-600 to-accent-600 text-white">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <Link to="/library" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4">
                        <FiArrowLeft className="w-4 h-4" />
                        Back to Library
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-start gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                    {organ.system}
                                </span>
                                <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                                    {organ.difficulty}
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
                                {organ.name}
                            </h1>
                            {organ.latinName && (
                                <p className="text-white/70 italic text-lg">{organ.latinName}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button onClick={handleBookmark} className="btn-icon bg-white/20 hover:bg-white/30 border-0">
                                <FiBookmark className="w-5 h-5" />
                            </button>
                            <Link to="/notes" className="btn-icon bg-white/20 hover:bg-white/30 border-0">
                                <FiEdit3 className="w-5 h-5" />
                            </Link>
                            {organ.model && (
                                <Link to={`/viewer/${organ.model.slug}`} className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                                    <FiBox className="w-5 h-5" />
                                    View 3D Model
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 -mt-6">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiInfo className="w-5 h-5 text-primary-500" />
                                Overview
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {organ.description}
                            </p>
                        </motion.div>

                        {/* Function */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-6"
                        >
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiZap className="w-5 h-5 text-yellow-500" />
                                Function
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                {organ.function}
                            </p>
                        </motion.div>

                        {/* Clinical Relevance */}
                        {organ.clinicalRelevance && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card p-6 border-l-4 border-primary-500"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FiHeart className="w-5 h-5 text-red-500" />
                                    Clinical Relevance
                                </h2>
                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                    {organ.clinicalRelevance}
                                </p>
                            </motion.div>
                        )}

                        {/* Related Disorders */}
                        {organ.relatedDisorders?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="glass-card p-6"
                            >
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <FiAlertCircle className="w-5 h-5 text-orange-500" />
                                    Related Disorders
                                </h2>
                                <div className="space-y-4">
                                    {organ.relatedDisorders.map((disorder, index) => (
                                        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                                {disorder.name}
                                            </h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                {disorder.description}
                                            </p>
                                            {disorder.symptoms?.length > 0 && (
                                                <div className="flex flex-wrap gap-2">
                                                    {disorder.symptoms.map((symptom, i) => (
                                                        <span key={i} className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded text-xs">
                                                            {symptom}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Key Facts */}
                        {organ.keyFacts?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-6"
                            >
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                    Key Facts
                                </h3>
                                <ul className="space-y-2">
                                    {organ.keyFacts.map((fact, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0" />
                                            {fact}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

                        {/* Blood Supply */}
                        {(organ.bloodSupply?.arteries?.length > 0 || organ.bloodSupply?.veins?.length > 0) && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="glass-card p-6"
                            >
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                    Blood Supply
                                </h3>
                                {organ.bloodSupply?.arteries?.length > 0 && (
                                    <div className="mb-3">
                                        <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Arteries</p>
                                        <div className="flex flex-wrap gap-1">
                                            {organ.bloodSupply.arteries.map((artery, i) => (
                                                <span key={i} className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs">
                                                    {artery}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {organ.bloodSupply?.veins?.length > 0 && (
                                    <div>
                                        <p className="text-xs font-semibold text-blue-500 uppercase tracking-wider mb-2">Veins</p>
                                        <div className="flex flex-wrap gap-1">
                                            {organ.bloodSupply.veins.map((vein, i) => (
                                                <span key={i} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                                                    {vein}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Connected Organs */}
                        {organ.connectedOrgans?.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="glass-card p-6"
                            >
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                                    Connected Structures
                                </h3>
                                <div className="space-y-2">
                                    {organ.connectedOrgans.map((conn, index) => (
                                        <Link
                                            key={index}
                                            to={`/organ/${conn.organ?.slug}`}
                                            className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                        >
                                            <span className="text-sm text-gray-700 dark:text-gray-300">{conn.organ?.name}</span>
                                            <FiExternalLink className="w-4 h-4 text-gray-400" />
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrganDetail;
