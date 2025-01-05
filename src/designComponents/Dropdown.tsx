import React from 'react'

interface DropdownProps {
    value: string
    onChange: (value: string) => void
    options: Array<{
        value: string
        label: string
    }>
    placeholder?: string
    disabled?: boolean
    className?: string
}

const Dropdown: React.FC<DropdownProps> = ({
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    className = '',
}) => {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={`
        w-full px-3 py-2 
        bg-white text-neutral-600
        border border-neutral-300 rounded-lg
        text-sm
        cursor-pointer
        transition-colors duration-200
        appearance-none
        bg-[url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")]
        bg-no-repeat bg-[length:16px] bg-[center_right_8px] pr-8
        hover:border-neutral-400
        focus:outline-none focus:ring-2 focus:ring-amber-600/20 focus:border-amber-600
        disabled:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-70
        ${className}
      `.trim()}
        >
            {placeholder && (
                <option value="" disabled>
                    {placeholder}
                </option>
            )}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    )
}

export default Dropdown 