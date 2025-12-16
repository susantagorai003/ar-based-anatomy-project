import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure upload directories exist
const modelsDir = path.join(__dirname, '../uploads/models');
const thumbnailsDir = path.join(__dirname, '../uploads/thumbnails');
const imagesDir = path.join(__dirname, '../uploads/images');

[modelsDir, thumbnailsDir, imagesDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Storage configuration for 3D models
const modelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, modelsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `model-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Storage configuration for thumbnails
const thumbnailStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, thumbnailsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `thumb-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Storage configuration for images
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imagesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `img-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// File filter for 3D models
const modelFileFilter = (req, file, cb) => {
    const allowedTypes = ['.glb', '.gltf'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only .glb and .gltf files are allowed for 3D models'), false);
    }
};

// File filter for images
const imageFileFilter = (req, file, cb) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed'), false);
    }
};

// Upload middleware for 3D models
export const uploadModel = multer({
    storage: modelStorage,
    fileFilter: modelFileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit for 3D models
    }
});

// Upload middleware for thumbnails
export const uploadThumbnail = multer({
    storage: thumbnailStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit for thumbnails
    }
});

// Upload middleware for general images
export const uploadImage = multer({
    storage: imageStorage,
    fileFilter: imageFileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit for images
    }
});

// Combined upload for model with thumbnail
export const uploadModelWithThumbnail = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            if (file.fieldname === 'model') {
                cb(null, modelsDir);
            } else if (file.fieldname === 'thumbnail') {
                cb(null, thumbnailsDir);
            } else {
                cb(null, imagesDir);
            }
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const prefix = file.fieldname === 'model' ? 'model' : file.fieldname === 'thumbnail' ? 'thumb' : 'img';
            cb(null, `${prefix}-${uniqueSuffix}${path.extname(file.originalname)}`);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'model') {
            modelFileFilter(req, file, cb);
        } else {
            imageFileFilter(req, file, cb);
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});
