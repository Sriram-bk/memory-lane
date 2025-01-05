import { ButtonOutline } from "../../designComponents/ButtonOutline";
import { ButtonSolid } from "../../designComponents/ButtonSolid";
import { ButtonText } from "../../designComponents/ButtonText";
import { Spinner } from "../../designComponents/Spinner";
import { TextArea } from "../../designComponents/TextArea";
import { TextField } from "../../designComponents/TextField";
import { useCreateMemory } from "../../services/hooks";
import { AddMemoryFormData, useAddMemoryForm } from "./hooks/useAddMemoryForm";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/20/solid";

interface AddMemoryFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

export const AddMemoryForm = ({ onCancel, onSuccess }: AddMemoryFormProps) => {
  const {
    register,
    handleSubmit,
    errors,
    reset,
    isValid,
    currentImages,
    handleImageChange,
    removeImage,
    isUploading,
    uploadError,
  } = useAddMemoryForm();

  const { mutate: createMemory, isPending } = useCreateMemory();

  const onSubmit = (data: AddMemoryFormData) => {
    createMemory(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-6">
        <TextField
          label="Date"
          type="date"
          error={errors.timestamp?.message}
          {...register('timestamp')}
          required
        />

        <TextField
          label="Title"
          error={errors.title?.message}
          {...register('title')}
          required
        />

        <TextArea
          label="Description"
          error={errors.description?.message}
          fixed
          rows={4}
          required
          {...register('description')}
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
          <ButtonOutline
            size='small'
            type="button"
            onClick={() => {
              reset();
              onCancel?.();
            }}
          >
            Cancel
          </ButtonOutline>
          <ButtonSolid
            size='small'
            type="submit"
            disabled={!isValid || isPending || isUploading}
            onClick={handleSubmit(onSubmit)}
          >
            {isPending ? (
              <>
                <Spinner size="small" />
                <span>Saving...</span>
              </>
            ) : (
              'Save Memory'
            )}
          </ButtonSolid>
        </div>
      </div>
    </form>
  );
};