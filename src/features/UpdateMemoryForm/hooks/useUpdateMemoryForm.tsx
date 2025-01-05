import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useState } from 'react';
import { Memory, useUpdateMemory } from '../../../services/hooks';
import { API_URL } from '../../../services/hooks/types';

interface UpdateMemoryFormData {
    title: string;
    description: string;
    timestamp: string;
    images: Array<{
        url: string;
        originalName: string;
    }>;
}

const schema: yup.ObjectSchema<UpdateMemoryFormData> = yup.object().shape({
    title: yup.string().required('Title is required'),
    description: yup.string().required('Description is required'),
    timestamp: yup.string().required('Date is required'),
    images: yup.array().of(
        yup.object().shape({
            url: yup.string().required('Image URL is required'),
            originalName: yup.string().required('Original name is required')
        })
    ).required()
}) as yup.ObjectSchema<UpdateMemoryFormData>;

interface UseUpdateMemoryFormProps {
    memory: Memory;
    onSuccess?: () => void;
}

export const useUpdateMemoryForm = ({ memory, onSuccess }: UseUpdateMemoryFormProps) => {
    const { mutate: updateMemory, isPending } = useUpdateMemory();
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        reset,
        setValue,
        watch,
    } = useForm<UpdateMemoryFormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            title: memory.title,
            description: memory.description,
            timestamp: memory.timestamp,
            images: memory.images,
        },
        mode: 'onChange',
    });

    const currentImages = watch('images') || [];

    const uploadImages = async (files: File[]) => {
        setIsUploading(true);
        setUploadError(null);
        try {
            const formData = new FormData();
            files.forEach(file => {
                formData.append('images', file);
            });

            const response = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Failed to upload images');
            }

            return data.files;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload images';
            setUploadError(message);
            throw error;
        } finally {
            setIsUploading(false);
        }
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        try {
            const uploadedFiles = await uploadImages(Array.from(files));
            setValue('images', [...currentImages, ...uploadedFiles]);
            setUploadError(null);
        } catch (error) {
            console.error('Failed to upload images:', error);
        }
    };

    const removeImage = (index: number) => {
        setValue('images', currentImages.filter((_, i) => i !== index));
    };

    const onSubmit = handleSubmit((data) => {
        updateMemory(
            {
                id: memory.id,
                title: data.title,
                description: data.description,
                timestamp: data.timestamp,
                images: data.images.map(img => ({
                    url: img.url,
                    originalName: img.originalName
                }))
            },
            {
                onSuccess: () => {
                    reset();
                    onSuccess?.();
                },
            }
        );
    });

    return {
        register,
        errors,
        onSubmit,
        isValid,
        isSubmitting: isPending,
        handleImageChange,
        removeImage,
        isUploading,
        currentImages,
        uploadError,
    };
}; 