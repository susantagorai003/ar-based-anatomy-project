import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit3, FiPlus, FiSearch, FiTrash2, FiX, FiSave, FiTag, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { notesAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const Notes = () => {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState({ title: '', content: '', tags: [] });

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await notesAPI.getNotes();
            setNotes(response.data.data || []);
        } catch (err) {
            setError('Failed to load notes. Please try again.');
            toast.error('Failed to load notes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateNote = async () => {
        try {
            const response = await notesAPI.create({
                title: 'New Note',
                content: '',
                type: 'general'
            });
            setNotes([response.data.data, ...notes]);
            setSelectedNote(response.data.data);
            setEditContent({ title: 'New Note', content: '', tags: [] });
            setIsEditing(true);
            toast.success('Note created');
        } catch (err) {
            toast.error('Failed to create note');
        }
    };

    const handleSaveNote = async () => {
        if (!selectedNote) return;
        try {
            await notesAPI.update(selectedNote._id, editContent);
            setNotes(notes.map(n => n._id === selectedNote._id ? { ...n, ...editContent } : n));
            setIsEditing(false);
            toast.success('Note saved');
        } catch (err) {
            toast.error('Failed to save note');
        }
    };

    const handleDeleteNote = async (id) => {
        try {
            await notesAPI.delete(id);
            setNotes(notes.filter(n => n._id !== id));
            if (selectedNote?._id === id) {
                setSelectedNote(null);
            }
            toast.success('Note deleted');
        } catch (err) {
            toast.error('Failed to delete note');
        }
    };

    const filteredNotes = notes.filter(note =>
        note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (error && notes.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <FiAlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {error}
                    </h3>
                    <button
                        onClick={fetchNotes}
                        className="btn-primary mt-4 flex items-center gap-2 mx-auto"
                    >
                        <FiRefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Sidebar - Notes list */}
            <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FiEdit3 className="text-primary-500" />
                            Notes
                        </h1>
                        <button
                            onClick={handleCreateNote}
                            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            <FiPlus className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notes..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                </div>

                {/* Notes list */}
                <div className="flex-1 overflow-y-auto">
                    {filteredNotes.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">
                            {notes.length === 0 ? 'No notes yet' : 'No matching notes'}
                        </div>
                    ) : (
                        <div className="p-2 space-y-1">
                            {filteredNotes.map((note) => (
                                <button
                                    key={note._id}
                                    onClick={() => {
                                        setSelectedNote(note);
                                        setEditContent({ title: note.title, content: note.content, tags: note.tags || [] });
                                        setIsEditing(false);
                                    }}
                                    className={`w-full text-left p-3 rounded-xl transition-colors ${selectedNote?._id === note._id
                                        ? 'bg-primary-100 dark:bg-primary-900/30'
                                        : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }`}
                                >
                                    <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                        {note.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                        {note.content || 'No content'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-gray-400">
                                            {new Date(note.updatedAt).toLocaleDateString()}
                                        </span>
                                        {note.tags?.length > 0 && (
                                            <span className="text-xs text-primary-500">
                                                {note.tags.length} tags
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main content - Note editor */}
            <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900">
                {selectedNote ? (
                    <>
                        {/* Editor header */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <div className="flex-1">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editContent.title}
                                        onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                                        className="text-xl font-semibold bg-transparent border-none outline-none w-full text-gray-900 dark:text-white"
                                        placeholder="Note title..."
                                    />
                                ) : (
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                        {selectedNote.title}
                                    </h2>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {isEditing ? (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="btn-ghost"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSaveNote}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            <FiSave className="w-4 h-4" />
                                            Save
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="btn-secondary flex items-center gap-2"
                                        >
                                            <FiEdit3 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteNote(selectedNote._id)}
                                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Editor content */}
                        <div className="flex-1 p-6 overflow-y-auto">
                            {isEditing ? (
                                <textarea
                                    value={editContent.content}
                                    onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
                                    placeholder="Start typing your notes..."
                                    className="w-full h-full min-h-[400px] bg-white dark:bg-gray-800 rounded-xl p-4 resize-none outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
                                />
                            ) : (
                                <div className="prose dark:prose-invert max-w-none">
                                    {selectedNote.content || (
                                        <p className="text-gray-400 italic">No content yet. Click edit to add notes.</p>
                                    )}
                                </div>
                            )}

                            {/* Tags */}
                            {!isEditing && selectedNote.tags?.length > 0 && (
                                <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <FiTag className="w-4 h-4 text-gray-400" />
                                    {selectedNote.tags.map((tag, i) => (
                                        <span key={i} className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Related content */}
                            {selectedNote.relatedOrgan && (
                                <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                                    <p className="text-sm text-gray-500 mb-1">Related to:</p>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        {selectedNote.relatedOrgan.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center">
                        <div className="text-center">
                            <FiEdit3 className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Select a note
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Choose a note from the sidebar or create a new one
                            </p>
                            <button onClick={handleCreateNote} className="btn-primary">
                                <FiPlus className="w-5 h-5 mr-2" />
                                Create Note
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notes;
