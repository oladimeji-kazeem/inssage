import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import type { AppRole, AppPermission, AppModule } from '../../services/userService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import '../ui/Modal.css';

import {
    ChevronRight, Shield, AlertCircle,
    LayoutDashboard, Database, Users, MessageSquarePlus, FileText, Library, BarChart2, Grid, GitBranch, Mic, Settings,
    List, Eye, X
} from 'lucide-react';
import { Switch } from '../ui/Switch';

interface RoleModalProps {
    type: 'create' | 'edit';
    role?: AppRole;
    onClose: () => void;
    onSuccess: () => void;
}

export const RoleModal: React.FC<RoleModalProps> = ({ type, role, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    const [allModules, setAllModules] = useState<AppModule[]>([]);
    const [allPermissions, setAllPermissions] = useState<AppPermission[]>([]);

    const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set());
    const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

    const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadMetadata = async () => {
            const [modules, perms] = await Promise.all([
                userService.getModules(),
                userService.getPermissions()
            ]);

            setAllModules(modules);
            setAllPermissions(perms);

            if (role) {
                setFormData({ name: role.name, description: role.description || '' });
                const [roleMods, rolePerms] = await Promise.all([
                    userService.getRoleModules(role.id),
                    userService.getRolePermissions(role.id)
                ]);
                setSelectedModules(new Set(roleMods));
                setSelectedPerms(new Set(rolePerms.map(p => p.id)));

                // Auto-expand active modules if any
                if (roleMods.length > 0) {
                    setExpandedModules(new Set(roleMods));
                }
            } else {
                setExpandedModules(new Set(modules.map(m => m.id)));
            }
        };
        loadMetadata();
    }, [role]);

    const handleModuleToggle = (modId: string, enabled: boolean) => {
        const next = new Set(selectedModules);
        if (enabled) {
            next.add(modId);
            setExpandedModules(prev => new Set(prev).add(modId));
        } else {
            next.delete(modId);
            // When disabling module, we also remove its perms from selection to be clean
            const mod = allModules.find(m => m.id === modId);
            if (mod) {
                const modPerms = allPermissions.filter(p => p.module === mod.name || p.module === mod.key);
                const nextPerms = new Set(selectedPerms);
                modPerms.forEach(p => nextPerms.delete(p.id));
                setSelectedPerms(nextPerms);
            }
        }
        setSelectedModules(next);
    };

    const handlePermToggle = (id: string) => {
        const next = new Set(selectedPerms);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedPerms(next);
    };

    const toggleExpand = (modId: string) => {
        const next = new Set(expandedModules);
        if (next.has(modId)) next.delete(modId);
        else next.add(modId);
        setExpandedModules(next);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let roleId = role?.id;

            if (type === 'create') {
                const newRole = await userService.createRole({
                    name: formData.name,
                    description: formData.description,
                    is_system_role: false
                });
                roleId = newRole.id;
            } else if (roleId) {
                await userService.updateRole(roleId, formData);
            }

            if (roleId) {
                // Sync Role Modules
                const currentMods = role ? await userService.getRoleModules(role.id) : [];
                const currentModIds = new Set(currentMods);

                for (const mId of currentModIds) {
                    if (!selectedModules.has(mId)) await userService.removeModuleFromRole(roleId, mId);
                }
                for (const mId of selectedModules) {
                    if (!currentModIds.has(mId)) await userService.assignModuleToRole(roleId, mId);
                }

                // Sync Role Permissions
                const currentPerms = role ? await userService.getRolePermissions(role.id) : [];
                const currentPermIds = new Set(currentPerms.map(p => p.id));

                for (const p of currentPerms) {
                    if (!selectedPerms.has(p.id)) await userService.removePermissionFromRole(roleId, p.id);
                }
                for (const pId of selectedPerms) {
                    if (!currentPermIds.has(pId)) await userService.assignPermissionToRole(roleId, pId);
                }
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getModuleIcon = (key: string) => {
        switch (key) {
            case 'control_plane': return <LayoutDashboard size={20} className="text-blue-600" />;
            case 'governance': return <Database size={20} className="text-purple-600" />;
            case 'user_mgmt': return <Users size={20} className="text-indigo-600" />;
            case 'chat': return <MessageSquarePlus size={20} className="text-green-600" />;
            case 'documents': return <FileText size={20} className="text-orange-600" />;
            case 'prompts': return <Library size={20} className="text-yellow-600" />;
            case 'analytics': return <BarChart2 size={20} className="text-red-600" />;
            case 'integrations': return <Grid size={20} className="text-teal-600" />;
            case 'workflows': return <GitBranch size={20} className="text-pink-600" />;
            case 'meetings': return <Mic size={20} className="text-cyan-600" />;
            case 'settings': return <Settings size={20} className="text-gray-600" />;
            default: return <Shield size={20} className="text-gray-500" />;
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content lg w-full max-w-4xl flex flex-col" style={{ height: '85vh', maxHeight: '800px' }}>
                <div className="flex justify-between items-center mb-0 pb-4 border-b bg-white z-10 shrink-0">
                    <div>
                        <h2 className="modal-header mb-1">{type === 'create' ? 'Create New Role' : 'Edit Role Configuration'}</h2>
                        <p className="text-sm text-gray-500">Define access tiers and granular privileges for this role.</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden pt-4">
                    <div className="flex gap-6 mb-4 px-1 shrink-0">
                        <div className="flex-1">
                            <Input
                                label="Role Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                icon={<Shield size={18} />}
                                placeholder="e.g. Content Moderator"
                            />
                        </div>
                        <div className="flex-[1.5]">
                            <Input
                                label="Description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the purpose of this role..."
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-1 py-2 custom-scrollbar pr-2">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 px-1 sticky top-0 bg-white pb-2 z-10 border-b border-white">
                            Module Access & Privileges
                        </h3>

                        <div className="grid gap-4 pb-4">
                            {allModules.map(mod => {
                                const isEnabled = selectedModules.has(mod.id);
                                const isExpanded = expandedModules.has(mod.id);
                                const modPerms = allPermissions.filter(p => p.module === mod.name || p.module === mod.key);

                                const tabPerms = modPerms.filter(p => p.code.includes('.view'));
                                const actionPerms = modPerms.filter(p => !p.code.includes('.view'));

                                return (
                                    <div
                                        key={mod.id}
                                        className={`border rounded-xl transition-all duration-200 ${isEnabled ? 'border-indigo-200 shadow-sm bg-white' : 'border-gray-100 bg-gray-50 opacity-90'}`}
                                    >
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleExpand(mod.id)}>
                                                <div className={`p-2 rounded-lg transition-colors ${isEnabled ? 'bg-indigo-50' : 'bg-gray-100'}`}>
                                                    {getModuleIcon(mod.key)}
                                                </div>
                                                <div>
                                                    <h4 className={`font-semibold text-base ${isEnabled ? 'text-gray-900' : 'text-gray-500'}`}>{mod.name}</h4>
                                                    <p className="text-xs text-gray-500">{mod.description}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <Switch
                                                    checked={isEnabled}
                                                    onChange={(c) => handleModuleToggle(mod.id, c)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExpand(mod.id)}
                                                    className={`p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
                                                >
                                                    <ChevronRight size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
                                            <div className="px-5 pb-5 pt-0 pl-[4.5rem]">
                                                <div className="h-px bg-gray-100 w-full mb-3"></div>

                                                {modPerms.length > 0 ? (
                                                    <div className="space-y-5">
                                                        {/* Tab Access Group */}
                                                        {tabPerms.length > 0 && (
                                                            <div>
                                                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                                    <List size={12} /> Tab Access
                                                                </h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                    {tabPerms.map(p => (
                                                                        <label key={p.id} className={`group flex items-center gap-2.5 p-2 rounded-md border cursor-pointer transition-all ${isEnabled ? 'hover:border-indigo-200 hover:bg-indigo-50/30 border-gray-100 bg-white' : 'opacity-40 cursor-not-allowed border-transparent'}`}>
                                                                            <input
                                                                                type="checkbox"
                                                                                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                checked={selectedPerms.has(p.id)}
                                                                                onChange={() => handlePermToggle(p.id)}
                                                                                disabled={!isEnabled}
                                                                            />
                                                                            <div className="flex-1">
                                                                                <div className={`text-sm font-medium ${isEnabled ? 'text-gray-700 group-hover:text-indigo-700' : 'text-gray-400'}`}>{(p.description || p.code).replace('View ', '').replace(' Tab', '')}</div>
                                                                            </div>
                                                                            <Eye size={14} className="text-gray-300" />
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Functional Capabilities */}
                                                        {actionPerms.length > 0 && (
                                                            <div>
                                                                <h5 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                                    <Shield size={12} /> Capabilities
                                                                </h5>
                                                                <div className="grid grid-cols-1 md:grid-cols-2  gap-2">
                                                                    {actionPerms.map(p => (
                                                                        <label key={p.id} className={`group flex items-start gap-2.5 p-2 rounded-md border cursor-pointer transition-all ${isEnabled ? 'hover:border-indigo-200 hover:bg-indigo-50/30 border-gray-100 bg-white' : 'opacity-40 cursor-not-allowed border-transparent'}`}>
                                                                            <input
                                                                                type="checkbox"
                                                                                className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                                checked={selectedPerms.has(p.id)}
                                                                                onChange={() => handlePermToggle(p.id)}
                                                                                disabled={!isEnabled}
                                                                            />
                                                                            <div>
                                                                                <div className={`text-sm font-medium ${isEnabled ? 'text-gray-700 group-hover:text-indigo-700' : 'text-gray-400'}`}>{p.code}</div>
                                                                                <div className="text-[11px] text-gray-500 leading-snug">{p.description}</div>
                                                                            </div>
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-gray-400 italic flex items-center gap-2 py-2">
                                                        <AlertCircle size={14} />
                                                        <span>No granular permissions configured for this module. Full access granted if enabled.</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="modal-footer pt-4 border-t mt-0 bg-white px-1">
                        <Button variant="outline" type="button" onClick={onClose} size="lg">Cancel</Button>
                        <Button type="submit" disabled={loading} size="lg" className="px-8 min-w-[200px]">
                            {loading ? 'Saving...' : 'Save Role Configuration'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
