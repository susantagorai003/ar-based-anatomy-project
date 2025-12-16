import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchQuizzes = createAsyncThunk(
    'quiz/fetchQuizzes',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/quiz', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch quizzes');
        }
    }
);

export const fetchQuizBySlug = createAsyncThunk(
    'quiz/fetchQuizBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const response = await api.get(`/quiz/${slug}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch quiz');
        }
    }
);

export const submitQuiz = createAsyncThunk(
    'quiz/submitQuiz',
    async ({ quizId, answers, startedAt, timeTaken }, { rejectWithValue }) => {
        try {
            const response = await api.post(`/quiz/${quizId}/submit`, {
                answers,
                startedAt,
                timeTaken,
            });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit quiz');
        }
    }
);

export const fetchQuizAttempts = createAsyncThunk(
    'quiz/fetchAttempts',
    async (quizId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/quiz/${quizId}/attempts`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch attempts');
        }
    }
);

export const fetchAttemptDetails = createAsyncThunk(
    'quiz/fetchAttemptDetails',
    async (attemptId, { rejectWithValue }) => {
        try {
            const response = await api.get(`/quiz/attempt/${attemptId}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch attempt');
        }
    }
);

const initialState = {
    quizzes: [],
    quizzesTotal: 0,
    currentQuiz: null,
    currentAttempt: null,
    attempts: [],
    // Active quiz session
    activeSession: {
        quizId: null,
        startedAt: null,
        currentQuestion: 0,
        answers: [],
        timeRemaining: null,
    },
    // Results
    lastResult: null,
    isLoading: false,
    isSubmitting: false,
    error: null,
};

const quizSlice = createSlice({
    name: 'quiz',
    initialState,
    reducers: {
        startQuizSession: (state, action) => {
            const { quizId, totalQuestions, timeLimit } = action.payload;
            state.activeSession = {
                quizId,
                startedAt: new Date().toISOString(),
                currentQuestion: 0,
                answers: Array(totalQuestions).fill(null),
                timeRemaining: timeLimit ? timeLimit * 60 : null, // Convert minutes to seconds
            };
        },
        setCurrentQuestion: (state, action) => {
            state.activeSession.currentQuestion = action.payload;
        },
        nextQuestion: (state) => {
            if (state.currentQuiz) {
                const totalQuestions = state.currentQuiz.questions.length;
                if (state.activeSession.currentQuestion < totalQuestions - 1) {
                    state.activeSession.currentQuestion += 1;
                }
            }
        },
        prevQuestion: (state) => {
            if (state.activeSession.currentQuestion > 0) {
                state.activeSession.currentQuestion -= 1;
            }
        },
        setAnswer: (state, action) => {
            const { questionIndex, answer } = action.payload;
            state.activeSession.answers[questionIndex] = answer;
        },
        updateTimeRemaining: (state, action) => {
            state.activeSession.timeRemaining = action.payload;
        },
        clearQuizSession: (state) => {
            state.activeSession = {
                quizId: null,
                startedAt: null,
                currentQuestion: 0,
                answers: [],
                timeRemaining: null,
            };
            state.currentQuiz = null;
            state.lastResult = null;
        },
        clearLastResult: (state) => {
            state.lastResult = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch quizzes
            .addCase(fetchQuizzes.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchQuizzes.fulfilled, (state, action) => {
                state.isLoading = false;
                state.quizzes = action.payload.data;
                state.quizzesTotal = action.payload.pagination?.total || 0;
            })
            .addCase(fetchQuizzes.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch quiz by slug
            .addCase(fetchQuizBySlug.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchQuizBySlug.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentQuiz = action.payload;
            })
            .addCase(fetchQuizBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Submit quiz
            .addCase(submitQuiz.pending, (state) => {
                state.isSubmitting = true;
            })
            .addCase(submitQuiz.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.lastResult = action.payload;
            })
            .addCase(submitQuiz.rejected, (state, action) => {
                state.isSubmitting = false;
                state.error = action.payload;
            })
            // Fetch attempts
            .addCase(fetchQuizAttempts.fulfilled, (state, action) => {
                state.attempts = action.payload;
            })
            // Fetch attempt details
            .addCase(fetchAttemptDetails.fulfilled, (state, action) => {
                state.currentAttempt = action.payload;
            });
    },
});

export const {
    startQuizSession,
    setCurrentQuestion,
    nextQuestion,
    prevQuestion,
    setAnswer,
    updateTimeRemaining,
    clearQuizSession,
    clearLastResult,
} = quizSlice.actions;

// Selectors
export const selectQuizzes = (state) => state.quiz.quizzes;
export const selectCurrentQuiz = (state) => state.quiz.currentQuiz;
export const selectActiveSession = (state) => state.quiz.activeSession;
export const selectLastResult = (state) => state.quiz.lastResult;
export const selectQuizAttempts = (state) => state.quiz.attempts;
export const selectCurrentAttempt = (state) => state.quiz.currentAttempt;
export const selectQuizLoading = (state) => state.quiz.isLoading;
export const selectQuizSubmitting = (state) => state.quiz.isSubmitting;

export default quizSlice.reducer;
