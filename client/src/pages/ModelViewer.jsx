import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
    FiMaximize, FiMinimize, FiRotateCw, FiZoomIn, FiZoomOut,
    FiLayers, FiInfo, FiBookmark, FiShare2, FiBox, FiMic, FiMicOff
} from 'react-icons/fi';
import { fetchModelBySlug, selectCurrentModel, selectAnatomyLoading, toggleBookmark } from '../store/slices/anatomySlice';
import { selectIsAuthenticated } from '../store/slices/authSlice';
import { setVoiceListening, selectIsVoiceListening } from '../store/slices/uiSlice';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import LayerControlPanel from '../components/viewer/LayerControlPanel';
import OrganInfoCard from '../components/viewer/OrganInfoCard';
import toast from 'react-hot-toast';

const ModelViewer = () => {
    const { slug } = useParams();
    const dispatch = useDispatch();
    const model = useSelector(selectCurrentModel);
    const isLoading = useSelector(selectAnatomyLoading);
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isVoiceListening = useSelector(selectIsVoiceListening);

    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showLayers, setShowLayers] = useState(false);
    const [selectedHotspot, setSelectedHotspot] = useState(null);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const viewerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        dispatch(fetchModelBySlug(slug));
    }, [dispatch, slug]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const handleBookmark = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to bookmark');
            return;
        }
        try {
            await dispatch(toggleBookmark({ anatomyModel: model._id })).unwrap();
            setIsBookmarked(!isBookmarked);
            toast.success(isBookmarked ? 'Bookmark removed' : 'Bookmarked!');
        } catch (err) {
            toast.error('Failed to update bookmark');
        }
    };

    const handleVoiceToggle = () => {
        dispatch(setVoiceListening(!isVoiceListening));
        if (!isVoiceListening) {
            toast.success('Voice commands activated. Try saying "rotate left" or "zoom in"');
        }
    };

    const handleHotspotClick = (hotspot) => {
        setSelectedHotspot(hotspot);
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
        <div ref={containerRef} className="h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
            {/* Main Viewer */}
            <div className="flex-1 relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                {/* Model Viewer */}
                <model-viewer
                    ref={viewerRef}
                    src={model.modelFile}
                    alt={model.name}
                    camera-controls
                    touch-action="pan-y"
                    auto-rotate
                    shadow-intensity="1"
                    exposure="0.75"
                    style={{ width: '100%', height: '100%' }}
                >
                    {/* Hotspots */}
                    {model.hotspots?.map((hotspot) => (
                        <button
                            key={hotspot.id}
                            className="hotspot"
                            slot={`hotspot-${hotspot.id}`}
                            data-position={`${hotspot.position.x}m ${hotspot.position.y}m ${hotspot.position.z}m`}
                            data-normal={`${hotspot.normal.x}m ${hotspot.normal.y}m ${hotspot.normal.z}m`}
                            onClick={() => handleHotspotClick(hotspot)}
                        >
                            <span className="text-xs">{hotspot.id}</span>
                        </button>
                    ))}
                </model-viewer>

                {/* Control overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                    {/* Model info */}
                    <div className="glass-card p-3">
                        <h1 className="font-semibold text-gray-900 dark:text-white">{model.name}</h1>
                        <p className="text-sm text-gray-500">{model.system} System</p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        <button onClick={handleVoiceToggle} className={`btn-icon ${isVoiceListening ? 'bg-red-500 text-white' : ''}`}>
                            {isVoiceListening ? <FiMicOff className="w-5 h-5" /> : <FiMic className="w-5 h-5" />}
                        </button>
                        <button onClick={handleBookmark} className={`btn-icon ${isBookmarked ? 'text-yellow-500' : ''}`}>
                            <FiBookmark className="w-5 h-5" />
                        </button>
                        <button className="btn-icon">
                            <FiShare2 className="w-5 h-5" />
                        </button>
                        <button onClick={toggleFullscreen} className="btn-icon">
                            {isFullscreen ? <FiMinimize className="w-5 h-5" /> : <FiMaximize className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <button onClick={() => setShowLayers(!showLayers)} className={`btn-icon ${showLayers ? 'bg-primary-500 text-white' : ''}`}>
                        <FiLayers className="w-5 h-5" />
                    </button>
                    <Link to={`/ar/${slug}`} className="ar-button">
                        <FiBox className="w-5 h-5" />
                        View in AR
                    </Link>
                    <button className="btn-icon">
                        <FiInfo className="w-5 h-5" />
                    </button>
                </div>

                {/* Voice listening indicator */}
                {isVoiceListening && (
                    <div className="voice-indicator listening">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Listening for voice commands...</span>
                    </div>
                )}
            </div>

            {/* Side panel */}
            {(showLayers || selectedHotspot) && (
                <motion.div
                    initial={{ x: 100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    className="w-full lg:w-80 bg-white dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-200 dark:border-gray-700 overflow-y-auto"
                >
                    {selectedHotspot ? (
                        <OrganInfoCard
                            hotspot={selectedHotspot}
                            onClose={() => setSelectedHotspot(null)}
                        />
                    ) : showLayers ? (
                        <LayerControlPanel onClose={() => setShowLayers(false)} />
                    ) : null}
                </motion.div>
            )}
        </div>
    );
};

export default ModelViewer;
