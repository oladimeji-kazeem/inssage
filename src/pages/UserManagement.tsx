import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import type { AppUser, AppRole } from '../services/userService';
import { Card } from '../components/ui/Card';
import { UserModal } from '../components/user_management/UserModal';
import { RoleModal } from '../components/user_management/RoleModal';
import { RBACAnalytics } from '../components/user_management/RBACAnalytics';
import { Shield, Users, Edit2, Trash2, Plus, Search, BarChart2, RefreshCw, UserPlus } from 'lucide-react';
import './Governance.css'; // Reusing premium styles

export const UserManagement: React.FC = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState<AppUser[]>([]);
    const [roles, setRoles] = useState<AppRole[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userModalType, setUserModalType] = useState<'create' | 'edit'>('create');
    const [selectedUser, setSelectedUser] = useState<AppUser | undefined>();

    const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
    const [roleModalType, setRoleModalType] = useState<'create' | 'edit'>('create');
    const [selectedRole, setSelectedRole] = useState<AppRole | undefined>();

    const loadData = async () => {
        if (activeTab === 'users') {
            const data = await userService.getUsers();
            setUsers(data);
        } else if (activeTab === 'roles') {
            const data = await userService.getRoles();
            setRoles(data);
        }
    };

    useEffect(() => { loadData(); }, [activeTab]);

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.department.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const handleEditUser = (u: AppUser) => { setSelectedUser(u); setUserModalType('edit'); setIsUserModalOpen(true); };
    const handleEditRole = (r: AppRole) => { setSelectedRole(r); setRoleModalType('edit'); setIsRoleModalOpen(true); };
    const handleDeleteRole = async (id: string) => { if (confirm('Are you sure?')) { await userService.deleteRole(id); loadData(); } };

    const tabs = [
        { id: 'users', label: 'Users Directory', icon: Users },
        { id: 'roles', label: 'Roles & Permissions', icon: Shield },
        { id: 'analytics', label: 'RBAC Analytics', icon: BarChart2 },
    ];

    return (
        <div className="gov-page">
            <div className="max-w-container">
                {/* Header */}
                <div className="gov-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="gov-title">User Management</h1>
                            <p className="gov-subtitle">Manage access control, roles, and security permissions.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {activeTab === 'users' && (
                                <button className="btn-upload" onClick={() => { setSelectedUser(undefined); setUserModalType('create'); setIsUserModalOpen(true); }}>
                                    <UserPlus size={18} /> Add User
                                </button>
                            )}
                            {activeTab === 'roles' && (
                                <button className="btn-upload" onClick={() => { setSelectedRole(undefined); setRoleModalType('create'); setIsRoleModalOpen(true); }}>
                                    <Shield size={18} /> Create Role
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="gov-tabs-container">
                    {tabs.map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`gov-tab ${activeTab === tab.id ? 'active' : ''}`}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ marginTop: '24px' }}>
                    {activeTab === 'users' && (
                        <div className="premium-table-container">
                            {/* Toolbar */}
                            <div className="catalog-toolbar" style={{ border: 'none', boxShadow: 'none', borderBottom: '1px solid #e5e7eb', borderRadius: 0 }}>
                                <div className="catalog-search-wrapper" style={{ maxWidth: '400px' }}>
                                    <Search className="catalog-search-icon" size={20} />
                                    <input
                                        className="catalog-search-input"
                                        placeholder="Search users by name, email, or department..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div style={{ overflowX: 'auto' }}>
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Department</th>
                                            <th>Assigned Roles</th>
                                            <th style={{ textAlign: 'right' }}>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map(user => (
                                                <tr key={user.id}>
                                                    <td>
                                                        <div className="user-cell">
                                                            <div className="avatar-circle" style={{ width: '40px', height: '40px' }}>
                                                                {getInitials(user.full_name)}
                                                            </div>
                                                            <div>
                                                                <div style={{ fontWeight: '600', color: '#111827' }}>{user.full_name}</div>
                                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="asset-tag" style={{ fontSize: '12px' }}>{user.department}</span>
                                                    </td>
                                                    <td>
                                                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                            {user.roles && user.roles.length > 0 ? (
                                                                user.roles.map(r => (
                                                                    <span key={r.id} className="sensitivity-badge sens-internal">
                                                                        {r.name}
                                                                    </span>
                                                                ))
                                                            ) : (
                                                                <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>No roles assigned</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td style={{ textAlign: 'right' }}>
                                                        <button
                                                            onClick={() => handleEditUser(user)}
                                                            style={{ padding: '8px', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', background: 'white' }}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={4} className="schema-empty">
                                                    No users found matching "{searchQuery}"
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'roles' && (
                        <div className="asset-grid">
                            {roles.map(role => (
                                <div key={role.id} className="asset-card">
                                    <div className="asset-header">
                                        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <div className={`asset-icon-box ${role.is_system_role ? 'icon-purple' : 'icon-blue'}`}>
                                                <Shield size={20} />
                                            </div>
                                            <div>
                                                <h3 className="asset-title">{role.name}</h3>
                                                <div className="asset-meta">
                                                    {role.is_system_role ? (
                                                        <span className="sensitivity-badge sens-restricted">System Role</span>
                                                    ) : (
                                                        <span className="sensitivity-badge sens-internal">Custom Role</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        {!role.is_system_role && (
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => handleEditRole(role)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af' }}><Edit2 size={16} /></button>
                                                <button onClick={() => handleDeleteRole(role.id)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={16} /></button>
                                            </div>
                                        )}
                                    </div>

                                    <p className="asset-desc" style={{ paddingLeft: 0, marginTop: '12px' }}>
                                        {role.description || 'No description provided.'}
                                    </p>

                                    <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6', marginTop: 'auto' }}>
                                        <button
                                            onClick={() => handleEditRole(role)}
                                            style={{ width: '100%', padding: '8px', color: '#4f46e5', fontWeight: '600', fontSize: '13px', background: '#eef2ff', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                                        >
                                            Manage Permissions
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'analytics' && <RBACAnalytics />}
                </div>

                {isUserModalOpen && (
                    <UserModal type={userModalType} user={selectedUser} onClose={() => setIsUserModalOpen(false)} onSuccess={loadData} />
                )}

                {isRoleModalOpen && (
                    <RoleModal type={roleModalType} role={selectedRole} onClose={() => setIsRoleModalOpen(false)} onSuccess={loadData} />
                )}
            </div>
        </div>
    );
};
