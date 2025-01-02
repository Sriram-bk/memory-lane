import { XMarkIcon } from '@heroicons/react/20/solid'
import { ButtonText } from './ButtonText'

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-lg',
  lg: 'sm:max-w-2xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex min-h-screen items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            aria-hidden="true"
            onClick={onClose}
          />

          {/* Modal Panel */}
          <div className={`
                        relative transform overflow-hidden rounded-lg bg-white shadow-xl 
                        transition-all sm:w-full ${sizeStyles[size]}
                    `}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 pt-4 pb-2 border-b border-gray-200">
              {title && (
                <h2
                  className="text-xl font-semibold text-gray-900 flex-1"
                  id="modal-title"
                >
                  {title}
                </h2>
              )}
              <ButtonText
                size="small"
                onClick={onClose}
                className="text-neutral-600"
                aria-label="Close modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </ButtonText>
            </div>

            {/* Content */}
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 