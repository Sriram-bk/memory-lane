import { ButtonSolid } from '../../designComponents/ButtonSolid';
import { ButtonOutline } from '../../designComponents/ButtonOutline';
import { ButtonText } from '../../designComponents/ButtonText';
import { TextField } from '../../designComponents/TextField';
import { TextArea } from '../../designComponents/TextArea';
import { Spinner } from '../../designComponents/Spinner';
import { useUpdateMemoryForm } from './hooks/useUpdateMemoryForm';
import { Memory } from '../../services/hooks';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/20/solid';

interface UpdateMemoryFormProps {
    memory: Memory;
    onCancel: () => void;
    onSuccess?: () => void;
}

export const UpdateMemoryForm = ({ memory, onCancel, onSuccess }: UpdateMemoryFormProps) => {
    const {
        register,
        errors,
        onSubmit,
        isSubmitting,
        handleImageChange,
        removeImage,
        isUploading,
        currentImages,
        uploadError,
        isValid,
    } = useUpdateMemoryForm({
        memory,
        onSuccess,
    });

    return (
        <form onSubmit={onSubmit} className="space-y-6">
            <TextField
                label="Date"
                type="date"
                {...register('timestamp')}
                error={errors.timestamp?.message}
                required
            />
            <TextField
                label="Title"
                {...register('title')}
                error={errors.title?.message}
                required
            />
            <TextArea
                label="Description"
                {...register('description')}
                error={errors.description?.message}
                fixed
                rows={4}
                required
            />

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Images
                </label>
                <div className="flex flex-wrap gap-4 mb-4">
                    {currentImages.map((image, index) => (
                        <div key={image.url} className="relative group">
                            <img
                                src={image.url}
                                alt={image.originalName}
                                className="h-24 w-24 object-cover rounded-lg"
                            />
                            <ButtonText
                                size="small"
                                className="absolute -top-2 -right-2 bg-neutral-50 shadow-sm text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full py-1 px-1"
                                onClick={() => removeImage(index)}
                            >
                                <XMarkIcon className="h-4 w-4" />
                            </ButtonText>
                        </div>
                    ))}
                    <label className={`h-24 w-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-500 transition-colors ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleImageChange}
                            disabled={isUploading}
                        />
                        {isUploading ? (
                            <Spinner size="small" className="text-amber-600" />
                        ) : (
                            <PhotoIcon className="h-8 w-8 text-gray-400" />
                        )}
                    </label>
                </div>
                {uploadError && (
                    <p className="text-sm text-red-600 mt-1">{uploadError}</p>
                )}
                {errors.images && (
                    <p className="text-sm text-red-600 mt-1">{errors.images.message}</p>
                )}
            </div>

            <div className="flex justify-end space-x-4">
                <ButtonOutline size="small" onClick={onCancel} type="button">
                    Cancel
                </ButtonOutline>
                <ButtonSolid size="small" type="submit" disabled={!isValid || isSubmitting || isUploading} onClick={onSubmit}>
                    {isSubmitting ? (
                        <>
                            <Spinner size="small" />
                            <span>Updating...</span>
                        </>
                    ) : (
                        'Update Memory'
                    )}
                </ButtonSolid>
            </div>
        </form>
    );
}; 