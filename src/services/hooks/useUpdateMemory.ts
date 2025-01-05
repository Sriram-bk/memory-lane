import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UpdateMemoryData, ApiResponse, API_URL } from './types';

/**
 * Hook to update an existing memory
 */
export const useUpdateMemory = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse, Error, UpdateMemoryData>({
        mutationFn: async ({ id, ...data }) => {
            const response = await fetch(`${API_URL}/memories/${id}`, {
                method: 'PUT',
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
        onSuccess: (_data: ApiResponse, variables: UpdateMemoryData) => {
            // Invalidate and refetch the updated memory and the list
            queryClient.invalidateQueries({ queryKey: ['memories'] });
            queryClient.invalidateQueries({ queryKey: ['memories', variables.id] });
        },
    });
}; 