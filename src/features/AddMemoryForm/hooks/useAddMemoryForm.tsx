import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useState } from 'react'
import { API_URL } from '../../../services/hooks/types'

export interface AddMemoryFormData {
  title: string;
  description: string;
  timestamp: string;
  images: Array<{
    url: string;
    originalName: string;
  }>;
}

const schema: yup.ObjectSchema<AddMemoryFormData> = yup.object().shape({
  title: yup.string().required('Title is required'),
  description: yup.string().required('Description is required'),
  timestamp: yup.string().required('Date is required'),
  images: yup.array().of(
    yup.object().shape({
      url: yup.string().required('Image URL is required'),
      originalName: yup.string().required('Original name is required')
    })
  ).required()
}) as yup.ObjectSchema<AddMemoryFormData>;

export const useAddMemoryForm = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
    setValue,
    watch,
  } = useForm<AddMemoryFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      timestamp: new Date().toISOString().split('T')[0],
      images: [],
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

  const resetForm = () => {
    reset();
    setUploadError(null);
  };

  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    reset: resetForm,
    isValid,
    currentImages,
    handleImageChange,
    removeImage,
    isUploading,
    uploadError,
  };
};
