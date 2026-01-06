import React from 'react';
import { Search, Bell, Mic } from 'lucide-react';
import './TopNav.css';
import { Button } from '../ui/Button';

export const TopNav: React.FC = () => {
    return (
        <header className="top-nav">
            <div className="search-bar">
                <Search className="search-icon" size={18} />
                <input
                    type="text"
                    placeholder="Search everything..."
                    className="search-input"
                />
                <div className="shortcut-hint">⌘K</div>
            </div>

            <div className="top-nav-actions">
                <Button variant="ghost" size="sm" className="action-btn">
                    <Mic size={18} />
                </Button>
                <Button variant="ghost" size="sm" className="action-btn relative">
                    <Bell size={18} />
                    <span className="notification-dot"></span>
                </Button>
                <div className="profile-menu">
                    <div className="avatar">OK</div>
                </div>
            </div>
        </header>
    );
};
