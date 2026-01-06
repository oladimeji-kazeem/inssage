import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    MessageSquarePlus, Search, FileText, Library, BarChart2,
    Grid, GitBranch, Mic, Settings, User, ChevronLeft, ChevronRight, LogOut, Shield
} from 'lucide-react';
import { clsx } from 'clsx';
import './Sidebar.css';

interface SidebarProps {
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
    const [collapsed, setCollapsed] = useState(false);

    const navItems = [
        { icon: MessageSquarePlus, label: 'New Chat', to: '/chat/new' },
        { icon: Search, label: 'Search Chats', to: '/search' },
        { icon: FileText, label: 'Documents', to: '/documents' },
        { icon: Library, label: 'Prompt Library', to: '/prompts' },
        { icon: BarChart2, label: 'Analytics', to: '/analytics' },
        { icon: Shield, label: 'Control Plane', to: '/control-plane' },
        { icon: Grid, label: 'Integrations', to: '/integrations' },
        { icon: GitBranch, label: 'Workflows', to: '/workflows' },
        { icon: Mic, label: 'Meeting Copilot', to: '/meetings' },
    ];

    const bottomItems = [
        { icon: Settings, label: 'Settings', to: '/settings' },
        { icon: User, label: 'Profile', to: '/profile' },
    ];

    return (
        <aside className={clsx('sidebar', collapsed && 'collapsed', className)}>
            <div className="sidebar-header">
                <div className="logo-area">
                    {!collapsed && <span className="logo-text">INSSAGE™</span>}
                </div>
                <button
                    className="collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => clsx('nav-item', isActive && 'active')}
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon size={20} />
                        {!collapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}

                <div className="divider"></div>

                {bottomItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => clsx('nav-item', isActive && 'active')}
                        title={collapsed ? item.label : undefined}
                    >
                        <item.icon size={20} />
                        {!collapsed && <span className="nav-label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item">
                    <LogOut size={20} />
                    {!collapsed && <span className="nav-label">Logout</span>}
                </button>
            </div>
        </aside>
    );
};
