import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import type { AppUser, AppRole } from '../../services/userService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import '../ui/Modal.css';

interface UserModalProps {
    type: 'create' | 'edit';
    user?: AppUser;
    onClose: () => void;
    onSuccess: () => void;
}

import { User, Mail, Briefcase, X, Save } from 'lucide-react';
import { Select } from '../ui/Select';

interface UserModalProps {
    type: 'create' | 'edit';
    user?: AppUser;
    onClose: () => void;
    onSuccess: () => void;
}

export const UserModal: React.FC<UserModalProps> = ({ type, user, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        department: '',
        role: '' // Legacy role or primary role
    });
    const [roles, setRoles] = useState<AppRole[]>([]);
    const [selectedRole, setSelectedRole] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadRoles = async () => {
            const data = await userService.getRoles();
            setRoles(data);
        };
        loadRoles();

        if (user) {
            setFormData({
                full_name: user.full_name,
                email: user.email,
                department: user.department,
                role: user.role
            });
            // Pre-select first RBAC role if available
            if (user.roles && user.roles.length > 0) {
                setSelectedRole(user.roles[0].id);
            }
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (type === 'edit' && user) {
                if (selectedRole) {
                    if (user.roles) {
                        for (const r of user.roles) {
                            await userService.removeRoleFromUser(user.id, r.id);
                        }
                    }
                    await userService.assignRoleToUser(user.id, selectedRole);
                }
            } else {
                console.log('Create User logic placeholder');
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const roleOptions = [
        { value: "", label: "Select a Role..." },
        ...roles.map(r => ({ value: r.id, label: r.name }))
    ];

    return (
        <div className="modal-overlay">
            <div className="modal-content md w-full flex flex-col" style={{ maxHeight: '85vh' }}>
                <div className="flex justify-between items-center mb-0 pb-4 border-b shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        {type === 'create' ? (
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600"><User size={20} /></div>
                        ) : (
                            <div className="bg-purple-100 p-2 rounded-full text-purple-600"><User size={20} /></div>
                        )}
                        {type === 'create' ? 'Add New User' : 'Edit User Profile'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto py-6 px-1 custom-scrollbar space-y-5">
                        <Input
                            label="Full Name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            disabled={type === 'edit'}
                            icon={<User size={18} />}
                            placeholder="e.g. Jane Doe"
                        />
                        <Input
                            label="Email Address"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            disabled={type === 'edit'}
                            icon={<Mail size={18} />}
                            placeholder="e.g. jane.doe@company.com"
                        />
                        <Input
                            label="Department"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            icon={<Briefcase size={18} />}
                            placeholder="e.g. Engineering"
                        />

                        <Select
                            label="Assign Role"
                            options={roleOptions}
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 border-t mt-0 bg-white shrink-0 flex justify-end gap-3">
                        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="min-w-[140px]">
                            <Save size={18} className="mr-2" />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
