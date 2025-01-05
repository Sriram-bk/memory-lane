import { useQuery } from '@tanstack/react-query';
import { Memory, API_URL, getFetchOptions } from './types';

/**
 * Hook to fetch all memories
 */
export const useGetMemories = (tokenId?: string) => {
    return useQuery<{ memories: Memory[] }>({
        queryKey: ['memories', tokenId],
        queryFn: async () => {
            const url = tokenId ? `${API_URL}/shared/${tokenId}/memories` : `${API_URL}/memories`;
            const response = await fetch(url, getFetchOptions());
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        },
    });
}; 