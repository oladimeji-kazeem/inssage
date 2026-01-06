import React, { type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import './Select.css';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
}

export const Select: React.FC<SelectProps> = ({ label, options, error, className = '', ...props }) => {
    return (
        <div className={`select-container ${className}`}>
            {label && <label className="select-label">{label}</label>}
            <div className="select-wrapper">
                <select className={`select-input ${error ? 'error' : ''}`} {...props}>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="select-icon" size={16} />
            </div>
            {error && <span className="select-error">{error}</span>}
        </div>
    );
};
