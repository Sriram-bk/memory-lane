export interface Image {
    id: number;
    url: string;
}

export interface Memory {
    id: number;
    title: string;
    description: string;
    timestamp: string;
    images: {
        id: number;
        url: string;
        originalName: string;
    }[];
}

export interface CreateMemoryData {
    title: string;
    description: string;
    timestamp: string;
    images: { url: string }[];
}

export interface UpdateMemoryData {
    id: number;
    title: string;
    description: string;
    timestamp: string;
    images: { url: string }[];
}

export interface ApiResponse<T> {
    data: T;
    error?: string;
}

export const API_URL = 'http://localhost:4001';

export const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getFetchOptions = (options: RequestInit = {}): RequestInit => ({
    credentials: 'include',
    ...options,
    headers: {
        ...getAuthHeaders(),
        ...(options.headers || {}),
    },
}); 