import React from 'react';
import { clsx } from 'clsx';
import './Card.css';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, hoverable, children, ...props }) => {
    return (
        <div className={clsx('card', hoverable && 'card-hoverable', className)} {...props}>
            {children}
        </div>
    );
};
