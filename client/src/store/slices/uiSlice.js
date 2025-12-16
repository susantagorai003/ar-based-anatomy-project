import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('theme');
        if (saved) return saved;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
};

const initialState = {
    theme: getInitialTheme(),
    sidebarOpen: true,
    modalOpen: null, // 'search', 'settings', 'share', etc.
    isVoiceListening: false,
    voiceCommand: null,
    arMode: false,
    arSupported: false,
    notifications: [],
    toasts: [],
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
            if (action.payload === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        toggleTheme: (state) => {
            const newTheme = state.theme === 'dark' ? 'light' : 'dark';
            state.theme = newTheme;
            localStorage.setItem('theme', newTheme);
            if (newTheme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        },
        setSidebarOpen: (state, action) => {
            state.sidebarOpen = action.payload;
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        openModal: (state, action) => {
            state.modalOpen = action.payload;
        },
        closeModal: (state) => {
            state.modalOpen = null;
        },
        setVoiceListening: (state, action) => {
            state.isVoiceListening = action.payload;
        },
        setVoiceCommand: (state, action) => {
            state.voiceCommand = action.payload;
        },
        clearVoiceCommand: (state) => {
            state.voiceCommand = null;
        },
        setArMode: (state, action) => {
            state.arMode = action.payload;
        },
        setArSupported: (state, action) => {
            state.arSupported = action.payload;
        },
        addNotification: (state, action) => {
            state.notifications.unshift({
                id: Date.now(),
                ...action.payload,
                read: false,
                createdAt: new Date().toISOString(),
            });
        },
        markNotificationRead: (state, action) => {
            const notification = state.notifications.find(n => n.id === action.payload);
            if (notification) {
                notification.read = true;
            }
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        addToast: (state, action) => {
            state.toasts.push({
                id: Date.now(),
                ...action.payload,
            });
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter(t => t.id !== action.payload);
        },
    },
});

export const {
    setTheme,
    toggleTheme,
    setSidebarOpen,
    toggleSidebar,
    openModal,
    closeModal,
    setVoiceListening,
    setVoiceCommand,
    clearVoiceCommand,
    setArMode,
    setArSupported,
    addNotification,
    markNotificationRead,
    clearNotifications,
    addToast,
    removeToast,
} = uiSlice.actions;

// Selectors
export const selectTheme = (state) => state.ui.theme;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectModalOpen = (state) => state.ui.modalOpen;
export const selectIsVoiceListening = (state) => state.ui.isVoiceListening;
export const selectVoiceCommand = (state) => state.ui.voiceCommand;
export const selectArMode = (state) => state.ui.arMode;
export const selectArSupported = (state) => state.ui.arSupported;
export const selectNotifications = (state) => state.ui.notifications;

export default uiSlice.reducer;
