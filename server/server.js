import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/auth.js';
import anatomyRoutes from './routes/anatomy.js';
import quizRoutes from './routes/quiz.js';
import bookmarkRoutes from './routes/bookmark.js';
import noteRoutes from './routes/notes.js';
import activityRoutes from './routes/activity.js';
import adminRoutes from './routes/admin.js';
import moduleRoutes from './routes/modules.js';
import notificationRoutes from './routes/notifications.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Socket.io setup for real-time collaboration
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploaded models
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/anatomy', anatomyRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Anatomy AR API is running' });
});

// Socket.io events for real-time collaboration
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a room (for shared AR sessions)
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Broadcast organ highlight to room
    socket.on('highlight-organ', (data) => {
        socket.to(data.roomId).emit('organ-highlighted', {
            organId: data.organId,
            organName: data.organName,
            highlightColor: data.highlightColor
        });
    });

    // Broadcast model rotation to room
    socket.on('rotate-model', (data) => {
        socket.to(data.roomId).emit('model-rotated', {
            rotation: data.rotation
        });
    });

    // Broadcast camera position
    socket.on('camera-update', (data) => {
        socket.to(data.roomId).emit('camera-updated', {
            position: data.position,
            target: data.target
        });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { io };
