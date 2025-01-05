import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { TextField } from '../../designComponents/TextField'
import { ButtonSolid } from '../../designComponents/ButtonSolid'
import { useAuth } from '../../services/hooks/useAuth'
import { useState } from 'react'

const schema = yup.object({
    email: yup.string().email('Must be a valid email').required('Email is required'),
    password: yup.string()
        .min(8, 'Password must be at least 8 characters')
        .required('Password is required'),
    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Please confirm your password'),
}).required()

type FormData = yup.InferType<typeof schema>

interface RegisterFormProps {
    onSuccess?: () => void
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
    const { register: registerUser } = useAuth()
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
            const { email, password } = data
            await registerUser.mutateAsync({
                username: email,
                email,
                password
            })
            onSuccess?.()
        } catch (error) {
            console.error('Registration failed:', error)
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError('An error occurred during registration')
            }
        }
    })

    return (
        <form onSubmit={onSubmit} className="space-y-4 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Create Account</h2>

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

            <TextField
                label="Confirm Password"
                type="password"
                {...register('confirmPassword')}
                error={errors.confirmPassword?.message}
            />

            <ButtonSolid
                type="submit"
                className="w-full"
                disabled={registerUser.isPending}
            >
                {registerUser.isPending ? 'Creating Account...' : 'Create Account'}
            </ButtonSolid>

            {(error || registerUser.error) && (
                <p className="text-red-500 text-sm mt-2">
                    {error || registerUser.error?.message || 'An error occurred during registration'}
                </p>
            )}
        </form>
    )
} 