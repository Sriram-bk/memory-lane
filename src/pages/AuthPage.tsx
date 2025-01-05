import { useState } from 'react'
import { LoginForm } from '../features/Auth/LoginForm'
import { RegisterForm } from '../features/Auth/RegisterForm'
import { useAuthContext } from '../features/Auth/AuthContext'
import { Navigate, useNavigate } from 'react-router-dom'

export const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true)
    const { isAuthenticated } = useAuthContext()
    const navigate = useNavigate()

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    const handleSuccess = () => {
        navigate('/')
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Memory Lane</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {isLogin ? "Welcome back!" : "Create your account"}
                    </p>
                </div>

                {isLogin ? (
                    <LoginForm onSuccess={handleSuccess} />
                ) : (
                    <RegisterForm onSuccess={handleSuccess} />
                )}

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-amber-600 hover:text-amber-500"
                    >
                        {isLogin
                            ? "Don't have an account? Sign up"
                            : "Already have an account? Sign in"}
                    </button>
                </div>
            </div>
        </div>
    )
} 