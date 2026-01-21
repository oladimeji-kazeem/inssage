import React from 'react';
import { clsx } from 'clsx';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, icon, ...props }, ref) => {
        return (
            <div className="input-field w-full">
                {label && <label className="input-label mb-1 block">{label}</label>}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={clsx(
                            'input',
                            error && 'input-error',
                            icon && 'pl-10',
                            className
                        )}
                        style={icon ? { paddingLeft: '2.5rem' } : {}}
                        {...props}
                    />
                </div>
                {error && <span className="input-error-message text-red-500 text-xs mt-1">{error}</span>}
            </div>
        );
    }
);

Input.displayName = 'Input';
