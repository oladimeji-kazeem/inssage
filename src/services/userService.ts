import { supabase } from '../lib/supabase';

export interface AppRole {
    id: string;
    name: string;
    description?: string;
    is_system_role: boolean;
}

export interface AppPermission {
    id: string;
    code: string;
    description?: string;
    module?: string;
}

export interface AppModule {
    id: string;
    key: string;
    name: string;
    description?: string;
}

export interface AppUser {
    id: string; // Employee ID
    full_name: string;
    email: string;
    role: string; // Legacy simple role
    department: string;
    status?: 'active' | 'inactive'; // Added for analytics
    roles?: AppRole[]; // New RBAC roles
}

export const userService = {
    // --- Roles ---
    async getRoles() {
        const { data, error } = await supabase
            .from('app_roles')
            .select('*')
            .order('name');
        if (error) throw error;
        return data as AppRole[];
    },

    async createRole(role: Partial<AppRole>) {
        const { data, error } = await supabase
            .from('app_roles')
            .insert(role)
            .select()
            .single();
        if (error) throw error;
        return data as AppRole;
    },

    async updateRole(id: string, updates: Partial<AppRole>) {
        const { data, error } = await supabase
            .from('app_roles')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data as AppRole;
    },

    async deleteRole(id: string) {
        const { error } = await supabase
            .from('app_roles')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // --- Permissions ---
    async getPermissions() {
        const { data, error } = await supabase
            .from('app_permissions')
            .select('*')
            .order('module, code');

        if (error) throw error;

        // Auto-seed Tab Permissions (Demo)
        const expectedPerms = [
            // Governance Tabs
            { code: 'governance.catalog.view', description: 'View Data Catalog Tab', module: 'Governance' },
            { code: 'governance.lineage.view', description: 'View Data Lineage Tab', module: 'Governance' },
            { code: 'governance.quality.view', description: 'View Data Quality Tab', module: 'Governance' },
            { code: 'governance.audit.view', description: 'View Audit Logs Tab', module: 'Governance' },

            // User Mgmt Tabs
            { code: 'user_mgmt.users.view', description: 'View Users Tab', module: 'User Management' },
            { code: 'user_mgmt.roles.view', description: 'View Roles Tab', module: 'User Management' },

            // Analytics Tabs
            { code: 'analytics.hris.view', description: 'View HRIS Dashboard', module: 'Analytics' },
            { code: 'analytics.recruitments.view', description: 'View Recruitments Tab', module: 'Analytics' },
            { code: 'analytics.performance.view', description: 'View HR Performance Tab', module: 'Analytics' },
            { code: 'analytics.payroll.view', description: 'View Payroll Analytics Tab', module: 'Analytics' },
            { code: 'analytics.sentiments.view', description: 'View Employee Sentiments Tab', module: 'Analytics' },
            { code: 'analytics.requests.view', description: 'View Request Analysis Tab', module: 'Analytics' },
            { code: 'analytics.life_balance.view', description: 'View Life Balance Tab', module: 'Analytics' },
            { code: 'analytics.skills.view', description: 'View Skills Analytics Tab', module: 'Analytics' },
            { code: 'analytics.training.view', description: 'View Employee Training Tab', module: 'Analytics' },
            { code: 'analytics.goals.view', description: 'View Employee Goals Tab', module: 'Analytics' },
            { code: 'analytics.assets.view', description: 'View Employee Assets Tab', module: 'Analytics' }
        ];

        const existingCodes = new Set(data?.map((p: any) => p.code));
        const missing = expectedPerms.filter(p => !existingCodes.has(p.code));

        if (missing.length > 0) {
            console.log('Seeding permissions...', missing);
            await supabase.from('app_permissions').insert(missing);
            // Re-fetch
            const { data: refetched } = await supabase.from('app_permissions').select('*').order('module, code');
            return refetched as AppPermission[];
        }

        return data as AppPermission[];
    },

    async getRolePermissions(roleId: string) {
        const { data, error } = await supabase
            .from('role_permissions')
            .select('permission_id, app_permissions(*)')
            .eq('role_id', roleId);
        if (error) throw error;
        return data.map((d: any) => d.app_permissions) as AppPermission[];
    },

    async assignPermissionToRole(roleId: string, permissionId: string) {
        const { error } = await supabase
            .from('role_permissions')
            .insert({ role_id: roleId, permission_id: permissionId });
        if (error) throw error;
    },

    async removePermissionFromRole(roleId: string, permissionId: string) {
        const { error } = await supabase
            .from('role_permissions')
            .delete()
            .match({ role_id: roleId, permission_id: permissionId });
        if (error) throw error;
    },

    // --- Users (Employees linked to Roles) ---
    async getUsers() {
        // Fetch employees with their assigned roles
        const { data, error } = await supabase
            .from('employees')
            .select(`
                *,
                employee_roles (
                    app_roles ( id, name, is_system_role )
                )
            `)
            .order('full_name');

        if (error) throw error;

        // Transform for easier frontend consumption
        return data.map((u: any) => ({
            ...u,
            roles: u.employee_roles?.map((er: any) => er.app_roles) || []
        }));
    },

    async assignRoleToUser(employeeId: string, roleId: string) {
        const { error } = await supabase
            .from('employee_roles')
            .insert({ employee_id: employeeId, role_id: roleId });
        if (error) throw error;
    },

    async removeRoleFromUser(employeeId: string, roleId: string) {
        const { error } = await supabase
            .from('employee_roles')
            .delete()
            .match({ employee_id: employeeId, role_id: roleId });
        if (error) throw error;
    },

    // --- Modules ---
    async getModules() {
        const { data, error } = await supabase
            .from('app_modules')
            .select('*')
            .order('name');

        if (error) throw error;

        // Auto-seed if missing (Demo convenience)
        const expectedModules = [
            { key: 'control_plane', name: 'Control Plane', description: 'Main dashboard' },
            { key: 'governance', name: 'Governance', description: 'Data catalog and lineage' },
            { key: 'user_mgmt', name: 'User Management', description: 'Manage users and roles' },
            { key: 'chat', name: 'Search Chats', description: 'AI Chat and Search' },
            { key: 'documents', name: 'Documents', description: 'Document management' },
            { key: 'prompts', name: 'Prompt Library', description: 'Manage AI prompts' },
            { key: 'analytics', name: 'Analytics', description: 'System analytics and reports' },
            { key: 'integrations', name: 'Integrations', description: 'Manage external integrations' },
            { key: 'workflows', name: 'Workflows', description: 'Workflow automation' },
            { key: 'meetings', name: 'Meeting Copilot', description: 'Meeting notes and summaries' },
            { key: 'settings', name: 'Settings', description: 'System configuration' }
        ];

        const existingKeys = new Set(data?.map((m: any) => m.key));
        const missing = expectedModules.filter(m => !existingKeys.has(m.key));

        if (missing.length > 0) {
            console.log('Seeding missing modules...', missing);
            await supabase.from('app_modules').insert(missing);
            // Re-fetch
            const { data: refetched } = await supabase.from('app_modules').select('*').order('name');
            return refetched as AppModule[];
        }

        return data as AppModule[];
    },

    async getRoleModules(roleId: string) {
        const { data, error } = await supabase
            .from('role_modules')
            .select('module_id')
            .eq('role_id', roleId);
        if (error) throw error;
        return data.map((d: any) => d.module_id) as string[];
    },

    async assignModuleToRole(roleId: string, moduleId: string) {
        const { error } = await supabase
            .from('role_modules')
            .insert({ role_id: roleId, module_id: moduleId });
        if (error) throw error;
    },

    async removeModuleFromRole(roleId: string, moduleId: string) {
        const { error } = await supabase
            .from('role_modules')
            .delete()
            .match({ role_id: roleId, module_id: moduleId });
        if (error) throw error;
    }
};
