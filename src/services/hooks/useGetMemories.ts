import { useQuery } from '@tanstack/react-query';
import { Memory, API_URL, getFetchOptions } from './types';

/**
 * Hook to fetch all memories
 */
export const useGetMemories = () => {
    return useQuery<{ memories: Memory[] }>({
        queryKey: ['memories'],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/memories`, getFetchOptions());
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
    });
}; 