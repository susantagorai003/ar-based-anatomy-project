import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            // Optionally redirect to login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;

// API helper functions
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    getMe: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    updatePreferences: (data) => api.put('/auth/preferences', data),
    changePassword: (data) => api.put('/auth/password', data),
};

export const anatomyAPI = {
    getModels: (params) => api.get('/anatomy/models', { params }),
    getModel: (slug) => api.get(`/anatomy/models/${slug}`),
    getOrgans: (params) => api.get('/anatomy/organs', { params }),
    getOrgan: (slug) => api.get(`/anatomy/organs/${slug}`),
    getSystems: () => api.get('/anatomy/systems'),
    search: (query) => api.get('/anatomy/search', { params: { q: query } }),
};

export const quizAPI = {
    getQuizzes: (params) => api.get('/quiz', { params }),
    getQuiz: (slug) => api.get(`/quiz/${slug}`),
    submitQuiz: (quizId, data) => api.post(`/quiz/${quizId}/submit`, data),
    getAttempts: (quizId) => api.get(`/quiz/${quizId}/attempts`),
    getAttempt: (attemptId) => api.get(`/quiz/attempt/${attemptId}`),
};

export const bookmarkAPI = {
    getBookmarks: (params) => api.get('/bookmarks', { params }),
    getFolders: () => api.get('/bookmarks/folders'),
    create: (data) => api.post('/bookmarks', data),
    update: (id, data) => api.put(`/bookmarks/${id}`, data),
    delete: (id) => api.delete(`/bookmarks/${id}`),
    toggle: (data) => api.post('/bookmarks/toggle', data),
};

export const notesAPI = {
    getNotes: (params) => api.get('/notes', { params }),
    getFolders: () => api.get('/notes/folders'),
    getNote: (id) => api.get(`/notes/${id}`),
    create: (data) => api.post('/notes', data),
    update: (id, data) => api.put(`/notes/${id}`, data),
    delete: (id) => api.delete(`/notes/${id}`),
    getByOrgan: (organId) => api.get(`/notes/organ/${organId}`),
};

export const activityAPI = {
    log: (data) => api.post('/activity/log', data),
    getMyActivity: (params) => api.get('/activity/me', { params }),
    getStats: (params) => api.get('/activity/stats', { params }),
    startSession: (data) => api.post('/activity/session/start', data),
    endSession: (data) => api.post('/activity/session/end', data),
};

export const moduleAPI = {
    getModules: (params) => api.get('/modules', { params }),
    getModule: (slug) => api.get(`/modules/${slug}`),
    rate: (id, rating) => api.post(`/modules/${id}/rate`, { rating }),
};

export const adminAPI = {
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
    deleteUser: (id) => api.delete(`/admin/users/${id}`),
    getEngagementAnalytics: (params) => api.get('/admin/analytics/engagement', { params }),
    getQuizAnalytics: (params) => api.get('/admin/analytics/quiz-performance', { params }),
    // Model management
    uploadModel: (formData) => api.post('/anatomy/models', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    }),
    updateModel: (id, data) => api.put(`/anatomy/models/${id}`, data),
    deleteModel: (id) => api.delete(`/anatomy/models/${id}`),
    // Quiz management
    createQuiz: (data) => api.post('/quiz', data),
    updateQuiz: (id, data) => api.put(`/quiz/${id}`, data),
    deleteQuiz: (id) => api.delete(`/quiz/${id}`),
    // Module management
    createModule: (data) => api.post('/modules', data),
    updateModule: (id, data) => api.put(`/modules/${id}`, data),
    deleteModule: (id) => api.delete(`/modules/${id}`),
};

export const notificationAPI = {
    getNotifications: (params) => api.get('/notifications', { params }),
    markAsRead: (id) => api.put(`/notifications/${id}/read`),
    markAllAsRead: () => api.put('/notifications/read-all'),
    delete: (id) => api.delete(`/notifications/${id}`),
    deleteAll: () => api.delete('/notifications'),
};

