import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '../../services/hooks/useAuth'

interface AuthContextType {
    isAuthenticated: boolean
    isLoading: boolean
    login: (username: string, password: string) => Promise<void>
    register: (username: string, email: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuthContext = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider')
    }
    return context
}

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const auth = useAuth()

    useEffect(() => {
        // Check if there's a valid token on mount
        const token = auth.getToken()
        setIsAuthenticated(!!token)
        setIsLoading(false)
    }, [])

    const login = async (username: string, password: string) => {
        await auth.login.mutateAsync({ username, password })
        setIsAuthenticated(true)
    }

    const register = async (username: string, email: string, password: string) => {
        await auth.register.mutateAsync({ username, email, password })
        setIsAuthenticated(true)
    }

    const logout = () => {
        auth.logout()
        setIsAuthenticated(false)
    }

    if (isLoading) {
        return <div>Loading...</div>
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
} 