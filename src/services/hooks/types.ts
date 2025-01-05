export interface Image {
    id: number;
    url: string;
}

export interface Memory {
    id: number;
    title: string;
    description: string;
    timestamp: string;
    images: Image[];
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