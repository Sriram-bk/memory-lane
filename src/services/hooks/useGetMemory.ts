import { useQuery } from '@tanstack/react-query';
import { Memory, API_URL } from './types';

/**
 * Hook to fetch a single memory by ID
 */
export const useGetMemory = (id: number) => {
    return useQuery<{ memory: Memory }>({
        queryKey: ['memories', id],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/memories/${id}`);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
        enabled: !!id, // Only run the query if we have an ID
    });
}; 