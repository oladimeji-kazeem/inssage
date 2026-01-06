import React from 'react';
import { clsx } from 'clsx';
import './Badge.css';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'error' | 'neutral' | 'primary';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'neutral', children, ...props }) => {
    return (
        <span className={clsx('badge', `badge-${variant}`, className)} {...props}>
            {children}
        </span>
    );
};
