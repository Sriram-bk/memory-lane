import { twMerge } from "tailwind-merge";
import type { ReactNode } from "react";

/**
 * Props for the ButtonText component.
 */
export type ButtonTextProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
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

export const ButtonText = ({
    children,
    className,
    disabled = false,
    onClick,
    size = "medium",
    type = "button",
    ...props
}: ButtonTextProps) => {
    let sizeClasses = '';
    switch (size) {
        case 'small':
            sizeClasses = 'py-2 px-3 text-sm space-x-0.5';
            break;
        case 'medium':
            sizeClasses = 'py-2 px-3 space-x-1.5';
            break;
        case 'large':
            sizeClasses = 'py-4 px-5 text-lg space-x-2.5';
            break;
    }

    return (
        <button
            type={type}
            className={twMerge(
                "text-amber-600 font-medium rounded-lg cursor-pointer flex items-center justify-center",
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
