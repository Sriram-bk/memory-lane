import { twMerge } from "tailwind-merge";
import type { ReactNode } from "react";

/**
 * Props for the ButtonOutline component.
 */
export type ButtonOutlineProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  /**
   * Children to be rendered inside the button. This can be text, icons, etc.
   */
  children?: ReactNode;
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
   * Function to be called when the button is clicked.
   */
  onClick: () => void;
  /**
   * How large should the button be?
   * @default 'medium'
   */
  size?: "small" | "medium" | "large";
  /**
   * The type attribute of the button.
   * @default 'button'
   */
  type?: "button" | "submit" | "reset";
};

export const ButtonOutline = ({
  children,
  className,
  disabled = false,
  onClick,
  size = "medium",
  type = "button",
  ...props
}: ButtonOutlineProps) => {
  let sizeClasses = '';
  switch (size) {
    case 'small':
      sizeClasses = 'py-2 px-3 text-sm';
      break;
    case 'medium':
      sizeClasses = 'py-2 px-3';
      break;
    case 'large':
      sizeClasses = 'py-4 px-5 text-lg';
      break;
  }

  return (
    <button
      type={type}
      className={twMerge(
        "bg-white text-neutral-600 rounded-lg cursor-pointer flex items-center justify-center border border-neutral-300",
        "[&>*]:mx-1.5 [&>:first-child]:ml-0 [&>:last-child]:mr-0",
        disabled && "opacity-50 cursor-not-allowed",
        !disabled && "hover:bg-neutral-100 active:ring-3 active:ring-neutral-200",
        sizeClasses,
        className,
      )}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
