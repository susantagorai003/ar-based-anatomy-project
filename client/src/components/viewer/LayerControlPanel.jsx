import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiEye, FiEyeOff } from 'react-icons/fi';
import {
    selectVisibleLayers,
    selectLayerOpacity,
    toggleLayer,
    setLayerOpacity,
    showOnlySystem,
    showAllSystems
} from '../../store/slices/anatomySlice';

const LayerControlPanel = ({ onClose }) => {
    const dispatch = useDispatch();
    const visibleLayers = useSelector(selectVisibleLayers);
    const layerOpacity = useSelector(selectLayerOpacity);

    const layers = [
        { id: 'skeletal', name: 'Skeletal System', color: '#9CA3AF', icon: '🦴' },
        { id: 'muscular', name: 'Muscular System', color: '#EF4444', icon: '💪' },
        { id: 'organs', name: 'Major Organs', color: '#DC2626', icon: '🫀' },
        { id: 'circulatory', name: 'Circulatory System', color: '#B91C1C', icon: '❤️' },
        { id: 'nervous', name: 'Nervous System', color: '#FBBF24', icon: '🧠' },
        { id: 'respiratory', name: 'Respiratory System', color: '#60A5FA', icon: '🫁' },
        { id: 'digestive', name: 'Digestive System', color: '#F59E0B', icon: '🍽️' },
        { id: 'urinary', name: 'Urinary System', color: '#A78BFA', icon: '🫘' },
        { id: 'endocrine', name: 'Endocrine System', color: '#10B981', icon: '⚗️' },
        { id: 'lymphatic', name: 'Lymphatic System', color: '#8B5CF6', icon: '🛡️' },
    ];

    const handleOpacityChange = (layerId, value) => {
        dispatch(setLayerOpacity({ layer: layerId, opacity: parseFloat(value) }));
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">Layer Control</h3>
                <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                    <FiX className="w-5 h-5" />
                </button>
            </div>

            {/* Quick actions */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                    <button
                        onClick={() => dispatch(showAllSystems())}
                        className="flex-1 py-2 px-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-lg text-sm font-medium hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                    >
                        Show All
                    </button>
                    <button
                        onClick={() => {
                            Object.keys(visibleLayers).forEach(layer => {
                                if (visibleLayers[layer]) dispatch(toggleLayer(layer));
                            });
                        }}
                        className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Hide All
                    </button>
                </div>
            </div>

            {/* Layer list */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {layers.map((layer) => (
                    <div
                        key={layer.id}
                        className={`p-3 rounded-xl border-2 transition-all ${visibleLayers[layer.id]
                                ? 'border-primary-300 dark:border-primary-600 bg-primary-50/50 dark:bg-primary-900/20'
                                : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'
                            }`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <button
                                onClick={() => dispatch(toggleLayer(layer.id))}
                                className={`p-1.5 rounded-lg transition-colors ${visibleLayers[layer.id]
                                        ? 'bg-primary-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                    }`}
                            >
                                {visibleLayers[layer.id] ? <FiEye className="w-4 h-4" /> : <FiEyeOff className="w-4 h-4" />}
                            </button>

                            <div
                                className="w-4 h-4 rounded-full flex-shrink-0"
                                style={{ backgroundColor: layer.color }}
                            />

                            <span className="flex-1 text-sm font-medium text-gray-900 dark:text-white">
                                {layer.icon} {layer.name}
                            </span>

                            <button
                                onClick={() => dispatch(showOnlySystem(layer.id))}
                                className="text-xs text-primary-500 hover:text-primary-600"
                            >
                                Solo
                            </button>
                        </div>

                        {/* Opacity slider */}
                        {visibleLayers[layer.id] && (
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs text-gray-500 w-16">Opacity</span>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={layerOpacity[layer.id]}
                                    onChange={(e) => handleOpacityChange(layer.id, e.target.value)}
                                    className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                />
                                <span className="text-xs text-gray-500 w-8 text-right">
                                    {Math.round(layerOpacity[layer.id] * 100)}%
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 text-center">
                    Toggle layers to show/hide body systems. Use opacity to see through layers.
                </p>
            </div>
        </div>
    );
};

export default LayerControlPanel;
