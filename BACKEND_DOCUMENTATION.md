# AR-Based Anatomy Learning Platform - Backend Documentation

> **Complete Backend Implementation Guide for Viva Presentation**  
> This document explains all backend technologies, architecture, and division of work among 3 team members.

---

## 📦 Technology Stack Overview

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 18.x+ | JavaScript runtime environment |
| **Express.js** | 4.18.2 | Web application framework |
| **MongoDB** | 6.x+ | NoSQL database |
| **Mongoose** | 8.0.3 | MongoDB ODM (Object Data Modeling) |
| **Socket.io** | 4.6.1 | Real-time bidirectional communication |
| **JWT** | 9.0.2 | Token-based authentication |
| **bcrypt.js** | 2.4.3 | Password hashing |
| **Multer** | 1.4.5 | File upload handling |
| **Helmet** | 7.1.0 | Security middleware |
| **Morgan** | 1.10.0 | HTTP request logger |
| **CORS** | 2.8.5 | Cross-Origin Resource Sharing |
| **Express Validator** | 7.0.1 | Input validation |
| **dotenv** | 16.3.1 | Environment variable management |

---

## 🏗️ Backend Architecture

```
server/
├── config/
│   └── db.js                 # MongoDB connection configuration
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   └── upload.js             # Multer file upload configuration
├── models/
│   ├── User.js               # User schema with authentication
│   ├── Quiz.js               # Quiz and questions schema
│   ├── QuizAttempt.js        # Quiz attempt tracking
│   ├── AnatomyModel.js       # 3D anatomy model metadata
│   ├── Organ.js              # Individual organ information
│   ├── Module.js             # Learning modules
│   ├── Bookmark.js           # User bookmarks
│   ├── Note.js               # User notes
│   └── ActivityLog.js        # User activity tracking
├── routes/
│   ├── auth.js               # Authentication endpoints
│   ├── anatomy.js            # Anatomy models & organs
│   ├── quiz.js               # Quiz management
│   ├── bookmark.js           # Bookmark operations
│   ├── notes.js              # Notes CRUD operations
│   ├── activity.js           # Activity logging
│   ├── admin.js              # Admin dashboard APIs
│   └── modules.js            # Module management
├── uploads/                  # Uploaded 3D models & images
├── seed.js                   # Database seeding script
├── server.js                 # Main application entry point
├── package.json              # Dependencies and scripts
└── .env                      # Environment variables
```

---

## 👥 Team Division (3 Members)

---

# 🔴 MEMBER 1: Authentication & User Management

## Responsibility Areas
- User authentication (Login/Register)
- JWT token management
- Password hashing with bcrypt
- User profile management
- Middleware for route protection

---

### 1.1 Database Connection (`config/db.js`)

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

**How it works:**
- Uses Mongoose to connect to MongoDB Atlas or local MongoDB
- Connection string is stored in `.env` file for security
- Exits the process if connection fails

---

### 1.2 User Model (`models/User.js`)

**Schema Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `firstName`, `lastName` | String | User's name (required, max 50 chars) |
| `email` | String | Unique, lowercase, validated with regex |
| `password` | String | Hashed, minimum 6 characters, `select: false` |
| `role` | String | 'student' or 'admin' |
| `avatar` | String | Profile picture URL |
| `institution` | String | Medical school/university |
| `yearOfStudy` | Number | 1-10 range |
| `stats` | Object | Learning statistics (points, study time, quizzes) |
| `preferences` | Object | Theme, language, AR quality settings |
| `isActive` | Boolean | Account status |
| `lastLogin` | Date | Last login timestamp |

**Key Features:**

1. **Password Hashing (Pre-save hook):**
```javascript
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
```
- Automatically hashes password before saving
- Uses 10 salt rounds for security
- Only hashes if password field is modified

2. **Password Comparison Method:**
```javascript
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};
```

---

### 1.3 Authentication Middleware (`middleware/auth.js`)

**Three Types of Middleware:**

| Middleware | Purpose | Usage |
|------------|---------|-------|
| `protect` | Requires valid JWT token | Protected routes |
| `adminOnly` | Requires admin role | Admin dashboard |
| `optionalAuth` | Attaches user if token exists | Public routes with optional user data |

**How JWT Authentication Works:**

```javascript
export const protect = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
        next();
    }
    
    if (!token) {
        return res.status(401).json({ message: 'Not authorized' });
    }
};
```

**Token Generation:**
```javascript
export const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};
```

---

### 1.4 Auth Routes (`routes/auth.js`)

| Route | Method | Description | Access |
|-------|--------|-------------|--------|
| `/api/auth/register` | POST | Register new user | Public |
| `/api/auth/login` | POST | Login user | Public |
| `/api/auth/me` | GET | Get current user | Private |
| `/api/auth/profile` | PUT | Update profile | Private |
| `/api/auth/preferences` | PUT | Update preferences | Private |
| `/api/auth/password` | PUT | Change password | Private |

**Registration Flow:**
1. Validate input using `express-validator`
2. Check if user already exists
3. Create user (password auto-hashed)
4. Generate JWT token
5. Return user data with token

**Login Flow:**
1. Find user by email
2. Check account is active
3. Compare password with `matchPassword()`
4. Update `lastLogin` timestamp
5. Generate and return JWT token

---

### 1.5 Important Viva Questions for Member 1

> **Q1: Why use bcrypt for password hashing?**
> bcrypt is slow by design (uses salt rounds), making brute-force attacks impractical. It automatically handles salting.

> **Q2: What is JWT and how does it work?**
> JSON Web Token is a stateless authentication mechanism. It contains encoded user ID, is signed with a secret, and expires after a set time.

> **Q3: Why is password field set to `select: false`?**
> Prevents password hash from being returned in queries by default. Must explicitly use `.select('+password')` when needed.

> **Q4: What is the purpose of middleware?**
> Functions that run between request and response. Used for authentication, logging, validation, etc.

---

# 🟢 MEMBER 2: Anatomy Models, Quiz System & Real-time Features

## Responsibility Areas
- Anatomy 3D model management
- Quiz creation and submission
- Score calculation and tracking
- Socket.io real-time collaboration
- Learning modules

---

### 2.1 AnatomyModel Schema (`models/AnatomyModel.js`)

**Key Fields:**
| Field | Type | Description |
|-------|------|-------------|
| `name`, `slug` | String | Model name and URL-friendly slug |
| `description` | String | Detailed description |
| `system` | Enum | Body system (skeletal, nervous, etc.) |
| `modelFile` | String | Path to .glb/.gltf 3D file |
| `thumbnail` | String | Preview image path |
| `scale`, `position`, `rotation` | Number/Object | 3D positioning |
| `hotspots` | Array | Interactive clickable points |
| `isARCompatible` | Boolean | AR support flag |
| `viewCount` | Number | Popularity tracking |

**Body Systems Supported:**
- Skeletal, Muscular, Circulatory, Nervous
- Respiratory, Digestive, Urinary, Endocrine
- Reproductive (Male/Female), Lymphatic
- Integumentary, Special Senses

**Text Search Index:**
```javascript
anatomyModelSchema.index({ name: 'text', description: 'text', tags: 'text' });
```
Enables full-text search across models.

---

### 2.2 Quiz System (`models/Quiz.js` & `models/QuizAttempt.js`)

**Quiz Schema Structure:**
```
Quiz
├── title, slug, description
├── system (body system)
├── questions[] (embedded)
│   ├── type: multiple-choice | true-false | fill-blank | organ-identification | drag-drop
│   ├── question (text)
│   ├── options[] (for MCQ)
│   ├── correctAnswer
│   ├── explanation
│   ├── points, difficulty, timeLimit
├── settings
│   ├── passingScore (default: 60%)
│   ├── timeLimit (minutes)
│   ├── shuffleQuestions, shuffleOptions
│   ├── showAnswersAfter
│   └── allowRetake, maxAttempts
└── statistics
    ├── attemptCount
    └── averageScore
```

**QuizAttempt Schema:**
Tracks each user's quiz attempt with:
- `user` and `quiz` references
- `answers[]` with `isCorrect`, `pointsEarned`
- `score`, `percentage`, `passed`
- `startedAt`, `completedAt`, `timeTaken`

---

### 2.3 Quiz Routes (`routes/quiz.js`)

| Route | Method | Description | Access |
|-------|--------|-------------|--------|
| `/api/quiz` | GET | Get all quizzes with filters | Public |
| `/api/quiz/:slug` | GET | Get quiz for taking (removes answers) | Private |
| `/api/quiz/:id/submit` | POST | Submit quiz answers | Private |
| `/api/quiz/attempts` | GET | Get user's quiz history | Private |
| `/api/quiz/attempts/:id` | GET | Get specific attempt details | Private |

**Score Calculation Logic:**
```javascript
const processedAnswers = quiz.questions.map(question => {
    const userAnswer = answers.find(a => a.questionId === question._id.toString());
    let isCorrect = false;
    
    switch (question.type) {
        case 'multiple-choice':
            const correctOption = question.options.find(o => o.isCorrect);
            isCorrect = correctOption && userAnswer.answer === correctOption.id;
            break;
        case 'true-false':
        case 'fill-blank':
            isCorrect = userAnswer.answer.toLowerCase() === 
                        question.correctAnswer.toLowerCase();
            break;
    }
    
    if (isCorrect) {
        score += question.points;
        correctAnswers++;
    }
});
```

**User Stats Update After Quiz:**
```javascript
user.stats.totalPoints += score;
user.stats.quizzesTaken += 1;
user.stats.averageScore = ((user.stats.averageScore * (user.stats.quizzesTaken - 1)) + percentage) 
                          / user.stats.quizzesTaken;
```

---

### 2.4 Anatomy Routes (`routes/anatomy.js`)

| Route | Method | Description | Access |
|-------|--------|-------------|--------|
| `/api/anatomy/models` | GET | Get 3D models with filters | Public |
| `/api/anatomy/models/:slug` | GET | Get single model details | Public |
| `/api/anatomy/organs` | GET | Get all organs | Public |
| `/api/anatomy/organs/:slug` | GET | Get organ details | Public |
| `/api/anatomy/systems` | GET | Get body systems with counts | Public |
| `/api/anatomy/search` | GET | Search organs and models | Public |
| `/api/anatomy/models` | POST | Upload new model (admin) | Admin |

---

### 2.5 Socket.io Real-time Features (`server.js`)

```javascript
const io = new Server(httpServer, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    // Join collaborative room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
    });

    // Broadcast organ highlight to room members
    socket.on('highlight-organ', (data) => {
        socket.to(data.roomId).emit('organ-highlighted', {
            organId: data.organId,
            organName: data.organName,
            highlightColor: data.highlightColor
        });
    });

    // Sync 3D model rotation
    socket.on('rotate-model', (data) => {
        socket.to(data.roomId).emit('model-rotated', {
            rotation: data.rotation
        });
    });

    // Sync camera position
    socket.on('camera-update', (data) => {
        socket.to(data.roomId).emit('camera-updated', {
            position: data.position,
            target: data.target
        });
    });
});
```

**Use Cases:**
- Students can view same 3D model together
- Teacher can highlight organs for all students
- Collaborative AR learning sessions

---

### 2.6 Important Viva Questions for Member 2

> **Q1: How are quiz answers hidden from the client?**
> When fetching quiz for taking, we remove `isCorrect` from options and `correctAnswer` from questions before sending to frontend.

> **Q2: What is Socket.io and why use it?**
> Socket.io enables real-time, bidirectional communication. Regular HTTP is request-response only; Socket.io maintains persistent connection for instant updates.

> **Q3: How does the scoring system work?**
> Each question has points. On submission, we compare user answers with correct answers, sum points for correct ones, calculate percentage, and update user's cumulative stats.

> **Q4: What is MongoDB aggregation?**
> Used for complex queries. Example: Getting count of organs per body system using `$group` and `$match` stages.

---

# 🔵 MEMBER 3: File Uploads, Notes, Bookmarks & Admin Features

## Responsibility Areas
- Multer file upload configuration
- Notes and Bookmarks CRUD
- Activity logging
- Admin dashboard APIs
- Security middleware (Helmet, CORS)

---

### 3.1 File Upload Middleware (`middleware/upload.js`)

**Multer Configuration for 3D Models:**
```javascript
import multer from 'multer';
import path from 'path';

const modelStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/models');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const modelFilter = (req, file, cb) => {
    const allowedTypes = ['.glb', '.gltf'];
    const ext = path.extname(file.originalname).toLowerCase();
    
    if (allowedTypes.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error('Only .glb and .gltf files allowed'), false);
    }
};

export const uploadModelWithThumbnail = multer({
    storage: modelStorage,
    fileFilter: modelFilter,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});
```

**Supported File Types:**
- 3D Models: `.glb`, `.gltf` (up to 50MB)
- Thumbnails: `.jpg`, `.png`, `.webp` (up to 5MB)

---

### 3.2 Bookmark System (`models/Bookmark.js` & `routes/bookmark.js`)

**Bookmark Schema:**
```javascript
const bookmarkSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    organ: { type: mongoose.Schema.Types.ObjectId, ref: 'Organ' },
    model: { type: mongoose.Schema.Types.ObjectId, ref: 'AnatomyModel' },
    note: String,
    tags: [String]
}, { timestamps: true });
```

| Route | Method | Description |
|-------|--------|-------------|
| `/api/bookmarks` | GET | Get user's bookmarks |
| `/api/bookmarks` | POST | Add bookmark |
| `/api/bookmarks/:id` | DELETE | Remove bookmark |
| `/api/bookmarks/check/:type/:id` | GET | Check if item is bookmarked |

---

### 3.3 Notes System (`models/Note.js` & `routes/notes.js`)

**Note Schema:**
```javascript
const noteSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    organ: { type: mongoose.Schema.Types.ObjectId, ref: 'Organ' },
    model: { type: mongoose.Schema.Types.ObjectId, ref: 'AnatomyModel' },
    tags: [String],
    isPinned: { type: Boolean, default: false },
    color: { type: String, default: '#ffffff' }
}, { timestamps: true });
```

| Route | Method | Description |
|-------|--------|-------------|
| `/api/notes` | GET | Get user's notes |
| `/api/notes` | POST | Create note |
| `/api/notes/:id` | PUT | Update note |
| `/api/notes/:id` | DELETE | Delete note |
| `/api/notes/:id/pin` | PUT | Toggle pin status |

---

### 3.4 Activity Logging (`models/ActivityLog.js` & `routes/activity.js`)

**Activity Types:**
- `model_view` - Viewed a 3D model
- `organ_view` - Viewed organ details
- `quiz_start`, `quiz_complete` - Quiz interactions
- `ar_session` - AR viewing session
- `note_create`, `bookmark_add` - User actions

**ActivityLog Schema:**
```javascript
const activityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    target: {
        type: { type: String }, // 'model', 'organ', 'quiz', etc.
        id: mongoose.Schema.Types.ObjectId,
        name: String
    },
    metadata: mongoose.Schema.Types.Mixed,
    duration: Number, // in seconds
    ipAddress: String,
    userAgent: String
}, { timestamps: true });
```

---

### 3.5 Admin Dashboard Routes (`routes/admin.js`)

| Route | Method | Description |
|-------|--------|-------------|
| `/api/admin/stats` | GET | Platform statistics |
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/:id` | PUT | Update user (activate/deactivate) |
| `/api/admin/models` | GET | Manage anatomy models |
| `/api/admin/quizzes` | GET | Manage quizzes |
| `/api/admin/activity` | GET | View all user activity |

**Admin Stats Response Example:**
```javascript
{
    totalUsers: 150,
    activeUsers: 142,
    totalModels: 45,
    totalQuizzes: 28,
    totalQuizAttempts: 1250,
    averageQuizScore: 72.5,
    popularSystems: [
        { system: 'skeletal', views: 450 },
        { system: 'nervous', views: 380 }
    ]
}
```

---

### 3.6 Security Middleware (`server.js`)

**Helmet Configuration:**
```javascript
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));
```
- Sets various HTTP headers for security
- Prevents XSS, clickjacking, MIME sniffing attacks
- `cross-origin` policy allows serving 3D models to AR clients

**CORS Configuration:**
```javascript
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
```
- Restricts API access to specific frontend origin
- `credentials: true` allows sending cookies/auth headers

**Morgan Logger:**
```javascript
app.use(morgan('dev'));
```
Logs all HTTP requests in development format:
```
GET /api/anatomy/models 200 45.123 ms
POST /api/auth/login 401 12.456 ms
```

---

### 3.7 Error Handling

**Global Error Handler:**
```javascript
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});
```

**404 Handler:**
```javascript
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
```

---

### 3.8 Important Viva Questions for Member 3

> **Q1: Why use Multer for file uploads?**
> Multer handles `multipart/form-data` (required for file uploads). It saves files to disk, generates unique filenames, and validates file types/sizes.

> **Q2: What is CORS and why is it needed?**
> Cross-Origin Resource Sharing. Browsers block requests from different origins by default. CORS headers tell browser which origins are allowed.

> **Q3: What is Helmet and what attacks does it prevent?**
> Helmet sets security headers: X-XSS-Protection, X-Content-Type-Options, Strict-Transport-Security, etc. Prevents XSS, clickjacking, MIME sniffing.

> **Q4: How does activity logging help?**
> Tracks user behavior for analytics, debugging, and improving UX. Helps identify popular content and user engagement patterns.

---

## 🔧 Environment Variables (`.env`)

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/anatomy-ar

# Authentication
JWT_SECRET=your-super-secret-key-here
JWT_EXPIRE=7d

# Client
CLIENT_URL=http://localhost:5173
```

---

## 🚀 How to Run the Backend

```bash
# Install dependencies
cd server
npm install

# Development mode (with auto-restart)
npm run dev

# Production mode
npm start

# Seed database with sample data
npm run seed
```

---

## 📊 API Response Format

**Success Response:**
```json
{
    "success": true,
    "data": { ... },
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 100,
        "pages": 5
    }
}
```

**Error Response:**
```json
{
    "success": false,
    "message": "Error description",
    "errors": [
        { "field": "email", "msg": "Invalid email format" }
    ]
}
```

---

## 📝 Summary Table for Viva

| Component | Technologies | Member |
|-----------|-------------|--------|
| Authentication | JWT, bcrypt, Express Validator | **Member 1** |
| User Management | Mongoose, MongoDB | **Member 1** |
| 3D Models API | Mongoose, Express | **Member 2** |
| Quiz System | Mongoose, Express | **Member 2** |
| Real-time Sync | Socket.io | **Member 2** |
| File Uploads | Multer | **Member 3** |
| Notes & Bookmarks | Mongoose, Express | **Member 3** |
| Security | Helmet, CORS | **Member 3** |
| Activity Logging | Mongoose | **Member 3** |
| Admin Dashboard | Express, Mongoose | **Member 3** |

---

> **📌 Tip for Viva:** Each member should understand their section deeply and be able to explain the code flow, why specific technologies were chosen, and how components interact with each other.
