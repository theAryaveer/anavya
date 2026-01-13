// TypeScript interfaces for Anvaya Book Recommendation System

// ========================================
// BOOK & SEARCH TYPES
// ========================================
export interface Book {
    book_id?: number;
    title: string;
    author?: string;
    authors?: string;
    rating?: number;        // avg_rating from SQLite
    match_score?: number;   // For backward compatibility (maps from score)
    score?: number;         // SVD recommendation score
    description?: string;
}

export interface SearchResponse {
    query: string;
    results: Book[];
}

export interface RecommendationResponse {
    user_id: number;
    recommendations: Book[];
}

// ========================================
// GENRE TYPES
// ========================================
export interface Genre {
    id: number;
    name: string;
}

// ========================================
// USER & AUTH TYPES
// ========================================
export interface SignupRequest {
    name: string;
    email: string;
    genre_id: number;
}

export interface SignupResponse {
    status: string;
    user_id: number;
    name: string;
    message: string;
}

export interface User {
    user_id: number;
    name: string;
    email?: string;
}

// ========================================
// ACTIVITY TRACKING TYPES
// ========================================
export interface ActivityRequest {
    user_id: number;
    book_id: number;
    action: string;
}

export interface ActivityResponse {
    status: string;
    message: string;
}

// ========================================
// HEALTH CHECK TYPES
// ========================================
export interface HealthCheck {
    status: string;
    database: string;
    svd_model: string;
    query_bin?: string;
    results_bin?: string;
}
