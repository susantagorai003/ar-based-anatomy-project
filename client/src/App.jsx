import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUser, selectIsAuthenticated, selectAuthLoading, selectIsAdmin } from './store/slices/authSlice';
import { selectTheme } from './store/slices/uiSlice';

// Layouts
import MainLayout from './components/layouts/MainLayout';
import AuthLayout from './components/layouts/AuthLayout';
import AdminLayout from './components/layouts/AdminLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Public Pages
import Home from './pages/Home';
import AnatomyLibrary from './pages/AnatomyLibrary';
import ModelViewer from './pages/ModelViewer';
import ARViewer from './pages/ARViewer';
import OrganDetail from './pages/OrganDetail';

// Student Pages
import Dashboard from './pages/student/Dashboard';
import QuizList from './pages/quiz/QuizList';
import TakeQuiz from './pages/quiz/TakeQuiz';
import QuizResult from './pages/quiz/QuizResult';
import Bookmarks from './pages/student/Bookmarks';
import Notes from './pages/student/Notes';
import Settings from './pages/student/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ModelManagement from './pages/admin/ModelManagement';
import OrganManagement from './pages/admin/OrganManagement';
import QuizManagement from './pages/admin/QuizManagement';
import ModuleManagement from './pages/admin/ModuleManagement';
import UserManagement from './pages/admin/UserManagement';

// Components
import LoadingSpinner from './components/ui/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectAuthLoading);

    if (isLoading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
    const isAdmin = useSelector(selectIsAdmin);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    const dispatch = useDispatch();
    const theme = useSelector(selectTheme);
    const token = localStorage.getItem('token');

    useEffect(() => {
        // Apply theme on mount
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    useEffect(() => {
        // Fetch current user if token exists
        if (token) {
            dispatch(fetchCurrentUser());
        }
    }, [dispatch, token]);

    return (
        <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            {/* Public & Student Routes */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/library" element={<AnatomyLibrary />} />
                <Route path="/viewer/:slug" element={<ModelViewer />} />
                <Route path="/ar/:slug" element={<ARViewer />} />
                <Route path="/organ/:slug" element={<OrganDetail />} />
                <Route path="/quizzes" element={<QuizList />} />

                {/* Protected Student Routes */}
                <Route path="/dashboard" element={
                    <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/quiz/:slug" element={
                    <ProtectedRoute><TakeQuiz /></ProtectedRoute>
                } />
                <Route path="/quiz/:slug/result" element={
                    <ProtectedRoute><QuizResult /></ProtectedRoute>
                } />
                <Route path="/bookmarks" element={
                    <ProtectedRoute><Bookmarks /></ProtectedRoute>
                } />
                <Route path="/notes" element={
                    <ProtectedRoute><Notes /></ProtectedRoute>
                } />
                <Route path="/settings" element={
                    <ProtectedRoute><Settings /></ProtectedRoute>
                } />
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminLayout />}>
                <Route path="/admin" element={
                    <AdminRoute><AdminDashboard /></AdminRoute>
                } />
                <Route path="/admin/models" element={
                    <AdminRoute><ModelManagement /></AdminRoute>
                } />
                <Route path="/admin/organs" element={
                    <AdminRoute><OrganManagement /></AdminRoute>
                } />
                <Route path="/admin/quizzes" element={
                    <AdminRoute><QuizManagement /></AdminRoute>
                } />
                <Route path="/admin/modules" element={
                    <AdminRoute><ModuleManagement /></AdminRoute>
                } />
                <Route path="/admin/users" element={
                    <AdminRoute><UserManagement /></AdminRoute>
                } />
            </Route>

            {/* 404 Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;
