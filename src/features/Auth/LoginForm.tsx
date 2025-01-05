import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { TextField } from '../../designComponents/TextField'
import { ButtonSolid } from '../../designComponents/ButtonSolid'
import { useAuth } from '../../services/hooks/useAuth'
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
    const { login } = useAuth()
    const [error, setError] = useState<string | null>(null)
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
            await login.mutateAsync({
                username: data.email,
                password: data.password
            })
            onSuccess?.()
        } catch (error) {
            console.error('Login failed:', error)
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('An error occurred during login')
            }
        }
    })

    return (
        <form onSubmit={onSubmit} className="space-y-4 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Login</h2>

            <TextField
                label="Email"
                type="email"
                {...register('email')}
                error={errors.email?.message}
            />

            <TextField
                label="Password"
                type="password"
                {...register('password')}
                error={errors.password?.message}
            />

            <ButtonSolid
                type="submit"
                className="w-full"
                disabled={login.isPending}
            >
                {login.isPending ? 'Logging in...' : 'Login'}
            </ButtonSolid>

            {(error || login.error) && (
                <p className="text-red-500 text-sm mt-2">
                    {error || login.error?.message || 'An error occurred during login'}
                </p>
            )}
        </form>
    )
} 