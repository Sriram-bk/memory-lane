import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse, API_URL } from './types';

/**
 * Hook to delete a memory
 */
export const useDeleteMemory = () => {
    const queryClient = useQueryClient();

    return useMutation<ApiResponse, Error, number>({
        mutationFn: async (id) => {
            const response = await fetch(`${API_URL}/memories/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        onSuccess: (_data: ApiResponse, id: number) => {
            // Invalidate and refetch memories list
            queryClient.invalidateQueries({ queryKey: ['memories'] });
            // Remove the deleted memory from the cache
            queryClient.removeQueries({ queryKey: ['memories', id] });
        },
    });
}; 