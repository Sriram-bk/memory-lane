import { useMutation, useQueryClient } from '@tanstack/react-query';
import { API_URL, getFetchOptions } from './types';

/**
 * Hook to delete a memory
 */
export const useDeleteMemory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            const response = await fetch(`${API_URL}/memories/${id}`, getFetchOptions({
                method: 'DELETE',
            }));
            if (!response.ok) {
                throw new Error('Failed to delete memory');
            }
            return response.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['memories'] });
        },
    });
}; 