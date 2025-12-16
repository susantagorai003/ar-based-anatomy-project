import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBox, FiPlus, FiEdit2, FiTrash2, FiSearch, FiUpload, FiX, FiEye } from 'react-icons/fi';
import { adminAPI, anatomyAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ModelManagement = () => {
    const [models, setModels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingModel, setEditingModel] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        system: 'skeletal',
        difficulty: 'beginner',
        modelFile: null,
        thumbnail: null,
    });

    useEffect(() => {
        fetchModels();
    }, []);

    const fetchModels = async () => {
        try {
            const response = await anatomyAPI.getModels();
            setModels(response.data.data);
        } catch (err) {
            toast.error('Failed to load models');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        try {
            if (editingModel) {
                await adminAPI.updateModel(editingModel._id, data);
                toast.success('Model updated');
            } else {
                await adminAPI.uploadModel(data);
                toast.success('Model uploaded');
            }
            fetchModels();
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save model');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this model?')) return;
        try {
            await adminAPI.deleteModel(id);
            setModels(models.filter(m => m._id !== id));
            toast.success('Model deleted');
        } catch (err) {
            toast.error('Failed to delete model');
        }
    };

    const openEditModal = (model) => {
        setEditingModel(model);
        setFormData({
            name: model.name,
            description: model.description,
            system: model.system,
            difficulty: model.difficulty,
            modelFile: null,
            thumbnail: null,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingModel(null);
        setFormData({ name: '', description: '', system: 'skeletal', difficulty: 'beginner', modelFile: null, thumbnail: null });
    };

    const filteredModels = models.filter(model =>
        model.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const systems = ['skeletal', 'muscular', 'organs', 'circulatory', 'nervous', 'respiratory', 'digestive', 'urinary', 'endocrine', 'lymphatic'];

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">
                        Model Management
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage 3D anatomy models ({models.length} total)
                    </p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <FiPlus className="w-5 h-5" />
                    Add Model
                </button>
            </div>

            {/* Search */}
            <div className="glass-card p-4 mb-6">
                <div className="relative">
                    <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search models..."
                        className="input-search"
                    />
                </div>
            </div>

            {/* Models table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Model</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">System</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredModels.map((model) => (
                                <tr key={model._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                                                {model.thumbnail ? (
                                                    <img src={model.thumbnail} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FiBox className="w-5 h-5 text-gray-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{model.name}</p>
                                                <p className="text-sm text-gray-500 truncate max-w-xs">{model.description}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm capitalize">
                                            {model.system}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-sm capitalize ${model.difficulty === 'beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                                model.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                            {model.difficulty}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1 text-gray-500">
                                            <FiEye className="w-4 h-4" />
                                            {model.viewCount || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${model.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {model.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(model)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(model._id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg">
                                                <FiTrash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {editingModel ? 'Edit Model' : 'Add New Model'}
                                </h2>
                                <button onClick={closeModal} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="input-field"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="input-field min-h-[100px]"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">System</label>
                                        <select value={formData.system} onChange={e => setFormData({ ...formData, system: e.target.value })} className="input-field">
                                            {systems.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Difficulty</label>
                                        <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })} className="input-field">
                                            <option value="beginner">Beginner</option>
                                            <option value="intermediate">Intermediate</option>
                                            <option value="advanced">Advanced</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Model File (.glb/.gltf)</label>
                                    <input
                                        type="file"
                                        accept=".glb,.gltf"
                                        onChange={e => setFormData({ ...formData, modelFile: e.target.files[0] })}
                                        className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-500 file:text-white file:cursor-pointer"
                                        required={!editingModel}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Thumbnail</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => setFormData({ ...formData, thumbnail: e.target.files[0] })}
                                        className="input-field file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-gray-500 file:text-white file:cursor-pointer"
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button type="button" onClick={closeModal} className="flex-1 btn-secondary">Cancel</button>
                                    <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2">
                                        <FiUpload className="w-4 h-4" />
                                        {editingModel ? 'Update' : 'Upload'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModelManagement;
