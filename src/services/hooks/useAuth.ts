import { useMutation } from '@tanstack/react-query'
import { API_URL } from './types'

interface LoginCredentials {
    username: string
    password: string
}

interface RegisterCredentials extends LoginCredentials {
    email: string
}

interface AuthResponse {
    token: string
    message?: string
}

interface DecodedToken {
    id: number;
    username: string;
    exp: number;
}

export const useAuth = () => {
    const login = useMutation({
        mutationFn: async (credentials: LoginCredentials): Promise<AuthResponse> => {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Login failed')
            }

            const data = await response.json()
            // Store token in localStorage
            localStorage.setItem('token', data.token)
            return data
        },
    })

    const register = useMutation({
        mutationFn: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Registration failed')
            }

            const data = await response.json()
            // Store token in localStorage
            localStorage.setItem('token', data.token)
            return data
        },
    })

    const logout = () => {
        localStorage.removeItem('token')
    }

    const getToken = () => localStorage.getItem('token')

    const isAuthenticated = () => !!getToken()

    const getCurrentUser = (): DecodedToken | null => {
        const token = getToken();
        if (!token) return null;

        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
                '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
            ).join(''));

            return JSON.parse(jsonPayload);
        } catch (e) {
            return null;
        }
    }

    return {
        login,
        register,
        logout,
        getToken,
        isAuthenticated,
        getCurrentUser,
    }
} 