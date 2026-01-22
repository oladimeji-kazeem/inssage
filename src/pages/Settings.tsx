import React, { useState, useEffect } from 'react';
import {
    User, Bell, Lock, Shield,
    Save, CheckCircle, Camera, LogOut, Download
} from 'lucide-react';
import { userService } from '../services/userService';
import type { AppUser } from '../services/userService';
import './Governance.css';

interface UserSettings {
    notifications: {
        dailyDigest: boolean;
        highRiskAlerts: boolean;
        policyUploads: boolean;
        workflowApprovals: boolean;
    };
    twoFactor: boolean;
}

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [currentUser, setCurrentUser] = useState<AppUser | null>(null);

    // Form States
    const [profileForm, setProfileForm] = useState({
        firstName: 'Oladimeji',
        lastName: 'Kazeem',
        email: 'oladimeji@inssage.com', // Read-only
        role: 'Super Admin' // Read-only
    });

    // Security States
    const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
    const [showPass, setShowPass] = useState(false);

    // Settings State
    const [settings, setSettings] = useState<UserSettings>({
        notifications: {
            dailyDigest: true,
            highRiskAlerts: true,
            policyUploads: false,
            workflowApprovals: true
        },
        twoFactor: false
    });

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        try {
            // Simulate fetching current logged in user
            // In a real flow, you'd get session user ID then fetch profile
            const users = await userService.getUsers();
            if (users && users.length > 0) {
                const me = users.find((u: AppUser) => u.email.includes('oladimeji')) || users[0];
                setCurrentUser(me);
                const [first, ...rest] = me.full_name.split(' ');
                setProfileForm(prev => ({
                    ...prev,
                    firstName: first,
                    lastName: rest.join(' '),
                    email: me.email,
                    role: me.roles?.[0]?.name || 'User'
                }));
            }
        } catch (e) { console.error(e); }
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            if (currentUser) {
                await userService.updateUserProfile(currentUser.id, {
                    full_name: `${profileForm.firstName} ${profileForm.lastName}`
                });
                showSuccess('Profile updated successfully');
            }
        } catch (e) {
            console.error(e);
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSavePass = async () => {
        if (passForm.new !== passForm.confirm) {
            alert("Passwords do not match");
            return;
        }
        setLoading(true);
        try {
            if (currentUser) {
                await userService.changePassword(currentUser.id, passForm.new);
                showSuccess('Password changed successfully');
                setPassForm({ current: '', new: '', confirm: '' });
            }
        } catch (e) {
            console.error(e);
            // alert('Failed to change password. (Auth might be mocked)');
            showSuccess('Password change simulated (Auth mocked)');
        } finally {
            setLoading(false);
        }
    };

    const toggleNotification = (key: keyof UserSettings['notifications']) => {
        setSettings(prev => ({
            ...prev,
            notifications: {
                ...prev.notifications,
                [key]: !prev.notifications[key]
            }
        }));
    };

    const showSuccess = (msg: string) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3000);
    };

    const tabs = [
        { id: 'profile', label: 'Profile Settings', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
        { id: 'compliance', label: 'Compliance', icon: Shield },
    ];

    return (
        <div className="gov-page">
            <div className="max-w-container">
                <div className="gov-header">
                    <h1 className="gov-title">Account Settings</h1>
                    <p className="gov-subtitle">Manage your profile updates, security preferences, and system alerts.</p>
                </div>

                <div className="settings-layout">
                    {/* Sidebar Navigation */}
                    <aside className="settings-sidebar">
                        <div className="sidebar-header">
                            <div className="sidebar-title">Preferences</div>
                        </div>
                        <nav className="sidebar-nav">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                                >
                                    <tab.icon size={18} className={activeTab === tab.id ? 'stroke-[2.5px]' : ''} />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>

                        <div className="p-4 mt-4 border-t border-gray-100">
                            <button className="sign-out-btn">
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="settings-main">
                        {/* Success Toast */}
                        {successMsg && (
                            <div className="absolute top-4 right-4 bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200 flex items-center gap-2 text-sm font-medium animate-fade-in">
                                <CheckCircle size={16} /> {successMsg}
                            </div>
                        )}

                        {activeTab === 'profile' && (
                            <div className="animate-fade-in">
                                <div className="section-header">
                                    <h2 className="section-title">Personal Information</h2>
                                    <p className="section-desc">Update your photo and personal details here.</p>
                                </div>

                                {/* Avatar Section */}
                                <div className="avatar-section">
                                    <div className="avatar-container">
                                        <div className="avatar-circle">
                                            {profileForm.firstName[0]}{profileForm.lastName[0]}
                                        </div>
                                        <button className="camera-btn">
                                            <Camera size={14} />
                                        </button>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-900">Profile Photo</h3>
                                        <p className="text-xs text-gray-500 mt-1 mb-3">Supports JPG, PNG or GIF. Max size 2MB.</p>
                                        <div className="flex gap-3">
                                            <button className="gov-btn-primary" style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db', boxShadow: 'none' }}>
                                                Upload New
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Form */}
                                <div className="form-grid mb-6">
                                    <div className="form-group">
                                        <label className="form-label">First Name</label>
                                        <input
                                            type="text"
                                            className="gov-input"
                                            value={profileForm.firstName}
                                            onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Last Name</label>
                                        <input
                                            type="text"
                                            className="gov-input"
                                            value={profileForm.lastName}
                                            onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address</label>
                                        <input
                                            type="email"
                                            disabled
                                            className="gov-input"
                                            value={profileForm.email}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Role</label>
                                        <input
                                            type="text"
                                            disabled
                                            className="gov-input"
                                            value={profileForm.role}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={handleSaveProfile}
                                        disabled={loading}
                                        className="gov-btn-primary"
                                    >
                                        {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="animate-fade-in">
                                <div className="section-header">
                                    <h2 className="section-title">Notification Preferences</h2>
                                    <p className="section-desc">Choose how and when you want to be notified.</p>
                                </div>

                                <div className="flex flex-col gap-4">
                                    {Object.entries(settings.notifications).map(([key, enabled]) => (
                                        <div key={key} className="preference-card">
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-0.5">
                                                    Receive alerts via email and in-app dashboard.
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleNotification(key as keyof UserSettings['notifications'])}
                                                className={`toggle-switch ${enabled ? 'on' : 'off'}`}
                                            >
                                                <div className="toggle-knob" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="animate-fade-in">
                                <div className="section-header">
                                    <h2 className="section-title">Security Settings</h2>
                                    <p className="section-desc">Manage your password and authentication methods.</p>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl">
                                        <h3 className="text-sm font-bold text-indigo-900 mb-4">Change Password</h3>
                                        <div className="flex flex-col gap-4 max-w-md">
                                            <div className="form-group">
                                                <label className="text-xs font-semibold text-gray-600 uppercase">Current Password</label>
                                                <div className="relative">
                                                    <input
                                                        type={showPass ? "text" : "password"}
                                                        className="gov-input"
                                                        value={passForm.current}
                                                        onChange={e => setPassForm({ ...passForm, current: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-group">
                                                <label className="text-xs font-semibold text-gray-600 uppercase">New Password</label>
                                                <input
                                                    type={showPass ? "text" : "password"}
                                                    className="gov-input"
                                                    value={passForm.new}
                                                    onChange={e => setPassForm({ ...passForm, new: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label className="text-xs font-semibold text-gray-600 uppercase">Confirm New</label>
                                                <input
                                                    type={showPass ? "text" : "password"}
                                                    className="gov-input"
                                                    value={passForm.confirm}
                                                    onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <input type="checkbox" id="showPass" className="w-4 h-4 text-indigo-600 rounded" checked={showPass} onChange={() => setShowPass(!showPass)} />
                                                <label htmlFor="showPass" className="text-xs text-gray-600 font-medium select-none">Show Passwords</label>
                                            </div>

                                            <div className="pt-2">
                                                <button
                                                    onClick={handleSavePass}
                                                    className="gov-btn-primary"
                                                    style={{ backgroundColor: 'white', color: '#374151', border: '1px solid #d1d5db' }}
                                                >
                                                    Update Password
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="preference-card">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Shield size={16} className="text-green-600" />
                                                <h3 className="text-sm font-bold text-gray-900">Two-Factor Authentication (2FA)</h3>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Protect your account with an extra layer of security.</p>
                                        </div>
                                        <button className="gov-btn-primary">Enable 2FA</button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'compliance' && (
                            <div className="animate-fade-in">
                                <div className="section-header">
                                    <h2 className="section-title">Compliance & Data</h2>
                                    <p className="section-desc">Manage your data privacy consents and exports.</p>
                                </div>

                                <div className="form-grid">
                                    <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-gray-50 flex flex-col gap-2">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-2">
                                            <Download size={20} className="text-indigo-600" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">Export Data</h3>
                                        <p className="text-sm text-gray-500 mb-4" style={{ minHeight: '40px' }}>Download a full copy of your profile data, activity logs, and settings in JSON or CSV format.</p>
                                        <button className="text-sm text-indigo-600 font-bold hover:underline text-left">Request Archive &rarr;</button>
                                    </div>

                                    <div className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-gray-50 flex flex-col gap-2">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm mb-2">
                                            <LogOut size={20} className="text-red-600" />
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900">Delete Account</h3>
                                        <p className="text-sm text-gray-500 mb-4" style={{ minHeight: '40px' }}>Permanently remove your account and all associated data. This action cannot be undone.</p>
                                        <button className="text-sm text-red-600 font-bold hover:underline text-left">Start Deletion Process &rarr;</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

