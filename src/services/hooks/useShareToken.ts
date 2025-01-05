import { useMutation } from '@tanstack/react-query';
import { API_URL, getFetchOptions } from './types';

export const useShareToken = () => {
    return useMutation({
        mutationFn: async () => {
            const response = await fetch(`${API_URL}/share-token`, getFetchOptions({
                method: 'POST',
            }));

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to get share token');
            }

            const data = await response.json();
            return data.token;
        },
    });
}; 