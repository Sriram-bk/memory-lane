import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { TextField } from '../../designComponents/TextField'
import { ButtonSolid } from '../../designComponents/ButtonSolid'
import { useAuthContext } from '../Auth/AuthContext'
import { useState } from 'react'

const schema = yup.object({
    email: yup.string().email('Must be a valid email').required('Email is required'),
    password: yup.string().required('Password is required'),
}).required()

type FormData = yup.InferType<typeof schema>

interface LoginFormProps {
    onSuccess?: () => void
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const { login } = useAuthContext()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        mode: 'onChange',
    })

    const onSubmit = handleSubmit(async (data) => {
        try {
            setError(null)
            setIsLoading(true)
            await login(data.email, data.password)
            onSuccess?.()
        } catch (error) {
            console.error('Login failed:', error)
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('An error occurred during login')
            }
        } finally {
            setIsLoading(false)
        }
    })

    return (
        <form onSubmit={onSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
                <TextField
                    label="Email"
                    type="email"
                    error={errors.email?.message}
                    {...register('email')}
                />
                <TextField
                    label="Password"
                    type="password"
                    error={errors.password?.message}
                    {...register('password')}
                />
            </div>

            {error && (
                <div className="text-red-500 text-sm mt-2">{error}</div>
            )}

            <ButtonSolid
                type="submit"
                disabled={isLoading}
                className="w-full"
            >
                {isLoading ? 'Signing in...' : 'Sign in'}
            </ButtonSolid>
        </form>
    )
} 