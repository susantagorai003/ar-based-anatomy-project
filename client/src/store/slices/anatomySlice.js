import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchModels = createAsyncThunk(
    'anatomy/fetchModels',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/anatomy/models', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch models');
        }
    }
);

export const fetchModelBySlug = createAsyncThunk(
    'anatomy/fetchModelBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const response = await api.get(`/anatomy/models/${slug}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch model');
        }
    }
);

export const fetchOrgans = createAsyncThunk(
    'anatomy/fetchOrgans',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/anatomy/organs', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch organs');
        }
    }
);

export const fetchOrganBySlug = createAsyncThunk(
    'anatomy/fetchOrganBySlug',
    async (slug, { rejectWithValue }) => {
        try {
            const response = await api.get(`/anatomy/organs/${slug}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch organ');
        }
    }
);

export const fetchSystems = createAsyncThunk(
    'anatomy/fetchSystems',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get('/anatomy/systems');
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch systems');
        }
    }
);

export const searchAnatomy = createAsyncThunk(
    'anatomy/search',
    async (query, { rejectWithValue }) => {
        try {
            const response = await api.get('/anatomy/search', { params: { q: query } });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Search failed');
        }
    }
);

export const fetchBookmarks = createAsyncThunk(
    'anatomy/fetchBookmarks',
    async (params = {}, { rejectWithValue }) => {
        try {
            const response = await api.get('/bookmarks', { params });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch bookmarks');
        }
    }
);

export const toggleBookmark = createAsyncThunk(
    'anatomy/toggleBookmark',
    async ({ anatomyModel, organ }, { rejectWithValue }) => {
        try {
            const response = await api.post('/bookmarks/toggle', { anatomyModel, organ });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to toggle bookmark');
        }
    }
);

const initialState = {
    models: [],
    modelsTotal: 0,
    currentModel: null,
    organs: [],
    organsTotal: 0,
    currentOrgan: null,
    systems: [],
    searchResults: { organs: [], models: [] },
    bookmarks: [],
    // Layer visibility for 3D viewer
    visibleLayers: {
        skeletal: true,
        muscular: false,
        organs: true,
        circulatory: false,
        nervous: false,
        respiratory: false,
        digestive: false,
        urinary: false,
        endocrine: false,
        lymphatic: false,
    },
    layerOpacity: {
        skeletal: 1,
        muscular: 1,
        organs: 1,
        circulatory: 1,
        nervous: 1,
        respiratory: 1,
        digestive: 1,
        urinary: 1,
        endocrine: 1,
        lymphatic: 1,
    },
    highlightedOrgan: null,
    isLoading: false,
    error: null,
};

const anatomySlice = createSlice({
    name: 'anatomy',
    initialState,
    reducers: {
        setVisibleLayer: (state, action) => {
            const { layer, visible } = action.payload;
            state.visibleLayers[layer] = visible;
        },
        toggleLayer: (state, action) => {
            const layer = action.payload;
            state.visibleLayers[layer] = !state.visibleLayers[layer];
        },
        setLayerOpacity: (state, action) => {
            const { layer, opacity } = action.payload;
            state.layerOpacity[layer] = opacity;
        },
        setHighlightedOrgan: (state, action) => {
            state.highlightedOrgan = action.payload;
        },
        clearHighlight: (state) => {
            state.highlightedOrgan = null;
        },
        showOnlySystem: (state, action) => {
            const system = action.payload;
            Object.keys(state.visibleLayers).forEach(key => {
                state.visibleLayers[key] = key === system;
            });
        },
        showAllSystems: (state) => {
            Object.keys(state.visibleLayers).forEach(key => {
                state.visibleLayers[key] = true;
            });
        },
        clearSearchResults: (state) => {
            state.searchResults = { organs: [], models: [] };
        },
        clearCurrentModel: (state) => {
            state.currentModel = null;
        },
        clearCurrentOrgan: (state) => {
            state.currentOrgan = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch models
            .addCase(fetchModels.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchModels.fulfilled, (state, action) => {
                state.isLoading = false;
                state.models = action.payload.data;
                state.modelsTotal = action.payload.pagination?.total || 0;
            })
            .addCase(fetchModels.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch model by slug
            .addCase(fetchModelBySlug.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchModelBySlug.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentModel = action.payload;
            })
            .addCase(fetchModelBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch organs
            .addCase(fetchOrgans.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchOrgans.fulfilled, (state, action) => {
                state.isLoading = false;
                state.organs = action.payload.data;
                state.organsTotal = action.payload.pagination?.total || 0;
            })
            .addCase(fetchOrgans.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch organ by slug
            .addCase(fetchOrganBySlug.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchOrganBySlug.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentOrgan = action.payload;
            })
            .addCase(fetchOrganBySlug.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
            })
            // Fetch systems
            .addCase(fetchSystems.fulfilled, (state, action) => {
                state.systems = action.payload;
            })
            // Search
            .addCase(searchAnatomy.fulfilled, (state, action) => {
                state.searchResults = action.payload;
            })
            // Bookmarks
            .addCase(fetchBookmarks.fulfilled, (state, action) => {
                state.bookmarks = action.payload.data;
            })
            .addCase(toggleBookmark.fulfilled, (state, action) => {
                if (!action.payload.bookmarked) {
                    // Bookmark was removed
                    state.bookmarks = state.bookmarks.filter(
                        b => b._id !== action.payload.data?._id
                    );
                }
            });
    },
});

export const {
    setVisibleLayer,
    toggleLayer,
    setLayerOpacity,
    setHighlightedOrgan,
    clearHighlight,
    showOnlySystem,
    showAllSystems,
    clearSearchResults,
    clearCurrentModel,
    clearCurrentOrgan,
} = anatomySlice.actions;

// Selectors
export const selectModels = (state) => state.anatomy.models;
export const selectCurrentModel = (state) => state.anatomy.currentModel;
export const selectOrgans = (state) => state.anatomy.organs;
export const selectCurrentOrgan = (state) => state.anatomy.currentOrgan;
export const selectSystems = (state) => state.anatomy.systems;
export const selectSearchResults = (state) => state.anatomy.searchResults;
export const selectVisibleLayers = (state) => state.anatomy.visibleLayers;
export const selectLayerOpacity = (state) => state.anatomy.layerOpacity;
export const selectHighlightedOrgan = (state) => state.anatomy.highlightedOrgan;
export const selectBookmarks = (state) => state.anatomy.bookmarks;
export const selectAnatomyLoading = (state) => state.anatomy.isLoading;

export default anatomySlice.reducer;
