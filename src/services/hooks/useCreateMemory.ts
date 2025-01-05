import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL, getFetchOptions } from './types';

interface CreateMemoryData {
    title: string;
    description: string;
    timestamp: string;
    images: {
        url: string;
        originalName: string;
    }[];
}

export const useCreateMemory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateMemoryData) => {
            const response = await fetch(`${API_URL}/memories`, getFetchOptions({
                method: 'POST',
                body: JSON.stringify(data),
            }));

            if (!response.ok) {
                throw new Error('Failed to create memory');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memories'] });
        },
    });
}; 