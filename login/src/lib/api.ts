import axios from 'axios';
import type {
    Book,
    SearchResponse,
    RecommendationResponse,
    Genre,
    SignupRequest,
    SignupResponse,
    ActivityRequest,
    ActivityResponse,
    HealthCheck
} from '../types';

// ========================================
// AXIOS INSTANCE
// ========================================
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000',
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ========================================
// GENRE ENDPOINTS
// ========================================

/**
 * Fetch all genres for signup dropdown
 */
export const getGenres = async (): Promise<Genre[]> => {
    try {
        const response = await api.get<Genre[]>('/genres');
        return response.data;
    } catch (error) {
        console.error("Genres API Error:", error);
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
                throw new Error('Failed to connect to backend. Please ensure the server is running.');
            }
            throw new Error(error.response?.data?.detail || 'Failed to load genres.');
        }
        throw new Error('An unexpected error occurred while loading genres.');
    }
};

// ========================================
// AUTH ENDPOINTS
// ========================================

/**
 * Register a new user with genre preference
 */
export const signup = async (data: SignupRequest): Promise<SignupResponse> => {
    try {
        const response = await api.post<SignupResponse>('/signup', data);
        return response.data;
    } catch (error) {
        console.error("Signup API Error:", error);
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
                throw new Error('Failed to connect to backend. Please ensure the server is running.');
            }
            // Handle duplicate email (400 error)
            if (error.response?.status === 400) {
                throw new Error(error.response?.data?.detail || 'Email already registered. Please use a different email.');
            }
            throw new Error(error.response?.data?.detail || 'Signup failed. Please try again.');
        }
        throw new Error('An unexpected error occurred during signup.');
    }
};

// ========================================
// SEARCH ENDPOINTS
// ========================================

/**
 * Search for books by query string
 */
export const searchBooks = async (query: string, k: number = 6): Promise<Book[]> => {
    try {
        const response = await api.get<SearchResponse>('/search', {
            params: { query, k },
        });

        // Handle response
        let results: Book[] = [];
        if (Array.isArray(response.data)) {
            results = response.data;
        } else {
            results = response.data.results || [];
        }

        // Map fields for frontend compatibility
        return results.map(book => ({
            ...book,
            authors: book.authors || book.author || 'Unknown Author',
            match_score: book.rating ? book.rating / 5 : undefined, // Normalize rating to 0-1 for display
        }));
    } catch (error) {
        console.error("Search API Error:", error);
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
                throw new Error('Failed to connect to backend. Please ensure the server is running.');
            }
            // Handle C++ engine timeout (504 error)
            if (error.response?.status === 504) {
                throw new Error('C++ search engine not responding. Please ensure hybrid_core.exe is running.');
            }
            throw new Error(error.response?.data?.detail || 'Failed to search books. Please try again.');
        }
        throw new Error('An unexpected error occurred while searching.');
    }
};

// ========================================
// RECOMMENDATION ENDPOINTS
// ========================================

/**
 * Get personalized recommendations for a user
 */
export const getRecommendations = async (userId: number): Promise<Book[]> => {
    try {
        const response = await api.get<RecommendationResponse>(`/recommend/${userId}`);

        // Handle response
        let results: Book[] = [];
        if (Array.isArray(response.data)) {
            results = response.data;
        } else {
            results = response.data.recommendations || [];
        }

        // Map score → match_score for frontend display
        return results.map(book => ({
            ...book,
            authors: book.authors || book.author || 'Unknown Author',
            match_score: book.score ? book.score / 5 : undefined, // Normalize score
        }));
    } catch (error) {
        console.error("Recommendation API Error:", error);
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK' || !error.response) {
                throw new Error('Failed to connect to backend. Please ensure the server is running.');
            }
            // Handle model not ready (500 error)
            if (error.response?.status === 500) {
                const detail = error.response?.data?.detail || '';
                if (detail.toLowerCase().includes('model') || detail.toLowerCase().includes('not ready')) {
                    throw new Error('MODEL_NOT_READY');
                }
                throw new Error(detail || 'Recommendation service unavailable.');
            }
            throw new Error(error.response?.data?.detail || 'Failed to load recommendations.');
        }
        throw new Error('An unexpected error occurred while loading recommendations.');
    }
};

// ========================================
// ACTIVITY TRACKING ENDPOINTS
// ========================================

/**
 * Log user activity (clicks, views, etc.)
 * Fails silently to not block UI
 */
export const logActivity = async (data: ActivityRequest): Promise<void> => {
    try {
        await api.post<ActivityResponse>('/activity', data);
        console.log(`📝 Logged: User ${data.user_id} ${data.action} Book ${data.book_id}`);
    } catch (error) {
        // Silent failure - don't block UI if activity logging fails
        console.warn("Activity logging failed (non-blocking):", error);
    }
};

// ========================================
// HEALTH CHECK ENDPOINTS
// ========================================

/**
 * Check API and component health status
 */
export const checkHealth = async (): Promise<HealthCheck> => {
    try {
        const response = await api.get<HealthCheck>('/health');
        return response.data;
    } catch (error) {
        console.error("Health check failed:", error);
        return {
            status: 'unhealthy',
            database: 'unknown',
            svd_model: 'unknown',
        };
    }
};

/**
 * Simple connectivity check
 */
export const checkApiHealth = async (): Promise<boolean> => {
    try {
        const health = await checkHealth();
        return health.status === 'healthy';
    } catch {
        return false;
    }
};

// ========================================
// USER SESSION HELPERS
// ========================================

/**
 * Store user session in localStorage
 */
export const saveUserSession = (userId: number, userName: string): void => {
    localStorage.setItem('user_id', userId.toString());
    localStorage.setItem('user_name', userName);
};

/**
 * Get user session from localStorage
 */
export const getUserSession = (): { userId: number | null; userName: string | null } => {
    const userId = localStorage.getItem('user_id');
    const userName = localStorage.getItem('user_name');
    return {
        userId: userId ? parseInt(userId, 10) : null,
        userName: userName,
    };
};

/**
 * Clear user session
 */
export const clearUserSession = (): void => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_name');
};
