import { twMerge } from "tailwind-merge";
import { forwardRef } from "react";
import type { ChangeEvent } from "react";

/**
 * Props for the TextField component.
 */
export type TextFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  /**
   * The label for the text field.
   */
  label: string;
  /**
   * Tailwind CSS class names to apply to the button.
   */
  className?: string;
  /**
   * Whether the button is disabled.
   * @default false
   * */
  disabled?: boolean;
  /**
   * Error message to display.
   * */
  error?: string;
  /**
   * Function to handle the change event of the text field.
   */
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(({
  className,
  label,
  disabled = false,
  error,
  required,
  onChange,
  ...props
}, ref) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-neutral-600">
        {label}
        {required && <span className="text-red-700 ml-0.5">*</span>}
      </label>
      <input
        ref={ref}
        type="text"
        className={twMerge(
          "mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 shadow-sm text-sm",
          "focus:ring-2 focus:ring-offset-0 focus:outline-none",
          !error && "focus:border-amber-600 focus:ring-amber-600/20",
          disabled && "opacity-50 cursor-not-allowed",
          error && "border-red-700 focus:border-red-700 focus:ring-red-700/20",
          className
        )}
        disabled={disabled}
        required={required}
        onChange={onChange}
        {...props}
      />
      {error && (
        <div className="flex items-center space-x-1 mt-1 text-xs text-red-700">
          <i className="ri-error-warning-fill text-sm" />
          <div>{error}</div>
        </div>
      )}
    </div>
  );
});

TextField.displayName = 'TextField';
