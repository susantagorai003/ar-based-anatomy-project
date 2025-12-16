import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import anatomyReducer from './slices/anatomySlice';
import quizReducer from './slices/quizSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        anatomy: anatomyReducer,
        quiz: quizReducer,
        ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
    devTools: import.meta.env.DEV,
});

export default store;
