import React from 'react';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Outlet } from 'react-router-dom';
import './MainLayout.css';

export const MainLayout: React.FC = () => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content-wrapper">
                <TopNav />
                <main className="page-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
