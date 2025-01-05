import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL, getFetchOptions } from './types';

interface UpdateMemoryData {
    id: number;
    title: string;
    description: string;
    timestamp: string;
    images: {
        url: string;
        originalName: string;
    }[];
}

export const useUpdateMemory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateMemoryData) => {
            const response = await fetch(`${API_URL}/memories/${data.id}`, getFetchOptions({
                method: 'PUT',
                body: JSON.stringify(data),
            }));

            if (!response.ok) {
                throw new Error('Failed to update memory');
            }

            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memories'] });
        },
    });
}; 