import React from 'react';
import { clsx } from 'clsx';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={clsx('btn', `btn-${variant}`, `btn-${size}`, className)}
                disabled={isLoading || props.disabled}
                {...props}
            >
                {isLoading && <span className="mr-2">...</span>}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
