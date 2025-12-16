import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiBox, FiRotateCw, FiZoomIn, FiInfo, FiCamera } from 'react-icons/fi';
import { fetchModelBySlug, selectCurrentModel, selectAnatomyLoading } from '../store/slices/anatomySlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const ARViewer = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const model = useSelector(selectCurrentModel);
    const isLoading = useSelector(selectAnatomyLoading);
    const [arStatus, setArStatus] = useState('checking'); // checking, supported, unsupported, active
    const [showInstructions, setShowInstructions] = useState(true);

    useEffect(() => {
        dispatch(fetchModelBySlug(slug));

        // Check AR support
        if (navigator.xr) {
            navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
                setArStatus(supported ? 'supported' : 'unsupported');
            });
        } else {
            // WebXR not available, but model-viewer can still do AR on mobile
            setArStatus('supported');
        }
    }, [dispatch, slug]);

    const handleARActivated = () => {
        setArStatus('active');
        setShowInstructions(false);
    };

    if (isLoading) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!model) {
        return (
            <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
                <div className="text-center">
                    <FiBox className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        Model not found
                    </h2>
                    <Link to="/library" className="btn-primary">
                        Back to Library
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Header */}
            <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={`/viewer/${slug}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="font-semibold text-gray-900 dark:text-white">{model.name}</h1>
                        <p className="text-sm text-gray-500">AR Mode</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowInstructions(!showInstructions)}
                        className="btn-icon"
                    >
                        <FiInfo className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Main AR Viewer */}
            <div className="flex-1 relative bg-gray-900">
                <model-viewer
                    src={model.modelFile}
                    alt={model.name}
                    ar
                    ar-modes="webxr scene-viewer quick-look"
                    ar-scale="auto"
                    camera-controls
                    touch-action="pan-y"
                    auto-rotate
                    shadow-intensity="1"
                    exposure="0.75"
                    style={{ width: '100%', height: '100%' }}
                    onArStatusChange={(e) => {
                        if (e.detail.status === 'session-started') {
                            handleARActivated();
                        }
                    }}
                >
                    {/* Custom AR button */}
                    <button
                        slot="ar-button"
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 ar-button text-lg shadow-2xl"
                    >
                        <FiCamera className="w-6 h-6" />
                        Place in Your Space
                    </button>

                    {/* Poster for loading */}
                    <div slot="poster" className="w-full h-full flex items-center justify-center bg-gray-900">
                        <LoadingSpinner size="lg" />
                    </div>
                </model-viewer>

                {/* Instructions overlay */}
                {showInstructions && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-4 left-4 right-4 glass-card p-4 max-w-md mx-auto"
                    >
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                            <FiInfo className="w-5 h-5 text-primary-500" />
                            How to Use AR
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
                                <span>Tap "Place in Your Space" to activate AR</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
                                <span>Point your camera at a flat surface</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
                                <span>Tap to place the model, then pinch to resize</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
                                <span>Tap on highlighted parts for more info</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => setShowInstructions(false)}
                            className="mt-4 w-full py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            Got it!
                        </button>
                    </motion.div>
                )}

                {/* Control hints */}
                <div className="absolute bottom-24 left-4 right-4 flex justify-center gap-6 text-white/70 text-sm">
                    <div className="flex items-center gap-2">
                        <FiRotateCw className="w-4 h-4" />
                        <span>Drag to rotate</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FiZoomIn className="w-4 h-4" />
                        <span>Pinch to zoom</span>
                    </div>
                </div>
            </div>

            {/* AR unsupported message */}
            {arStatus === 'unsupported' && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                    <div className="glass-card p-6 max-w-md text-center">
                        <FiBox className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            AR Not Supported
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            AR requires a compatible mobile device. You can still view the 3D model with full interactivity.
                        </p>
                        <Link to={`/viewer/${slug}`} className="btn-primary">
                            View in 3D Instead
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ARViewer;
