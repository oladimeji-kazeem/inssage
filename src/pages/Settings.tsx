import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User, Bell, Lock, Shield } from 'lucide-react';

export const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security & Access', icon: Lock },
        { id: 'compliance', label: 'Compliance Rules', icon: Shield },
    ];

    return (
        <div className="flex gap-8 h-full">
            {/* Settings Sidebar */}
            <div className="w-64 flex flex-col gap-1">
                <h1 className="text-2xl font-bold mb-6 px-2">Settings</h1>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`text-left px-4 py-3 rounded-md flex items-center gap-3 text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-[var(--color-bg-active)] text-primary' : 'text-secondary hover:bg-[var(--color-bg-hover)]'
                            }`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Settings Content */}
            <div className="flex-1 max-w-2xl">
                <Card className="p-8">
                    {activeTab === 'profile' && (
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xl font-bold pb-4 border-b border-[var(--color-border)]">Profile Settings</h2>

                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-xl font-bold">
                                    OK
                                </div>
                                <Button variant="outline" size="sm">Change Avatar</Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Input label="First Name" defaultValue="Oladimeji" />
                                <Input label="Last Name" defaultValue="Kazeem" />
                            </div>
                            <Input label="Email" defaultValue="oladimeji@inssage.com" disabled />
                            <Input label="Role" defaultValue="Super Admin" disabled />

                            <div className="flex justify-end mt-4">
                                <Button>Save Changes</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="flex flex-col gap-6">
                            <h2 className="text-xl font-bold pb-4 border-b border-[var(--color-border)]">Notification Preferences</h2>

                            <div className="space-y-4">
                                {['Daily Compliance Digest', 'High Risk Alerts (Real-time)', 'New Policy Uploads', 'Workflow Approvals'].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border border-[var(--color-border)] rounded-md">
                                        <span className="font-medium text-sm">{item}</span>
                                        <input type="checkbox" defaultChecked />
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button>Save Preferences</Button>
                            </div>
                        </div>
                    )}

                    {/* Other tabs placeholders */}
                    {(activeTab === 'security' || activeTab === 'compliance') && (
                        <div className="text-center py-12 text-secondary">
                            <Lock size={48} className="mx-auto mb-4 opacity-20" />
                            <p>This section is managed by your organization's IT Admin.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
