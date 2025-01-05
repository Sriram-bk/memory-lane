import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateMemoryData, ApiResponse, API_URL } from './types';

/**
 * Hook to create a new memory
 */
export const useCreateMemory = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse, Error, CreateMemoryData>({
        mutationFn: async (data) => {
            const response = await fetch(`${API_URL}/memories`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        onSuccess: () => {
            // Invalidate and refetch memories list
            queryClient.invalidateQueries({ queryKey: ['memories'] });
        },
    });
}; 