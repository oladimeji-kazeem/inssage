import { supabase } from '../lib/supabase';

export interface DataAsset {
    id: string;
    name: string;
    type: string;
    source?: string;
    owner_id?: string;
    sensitivity_level: string;
    description?: string;
    tags?: string[];
    definitions?: DataDefinition[];
}

export interface DataDefinition {
    id: string;
    asset_id: string;
    field_name: string;
    data_type: string;
    is_pii: boolean;
    description?: string;
}

export interface DataQualityRule {
    id: string;
    asset_id: string;
    rule_name: string;
    rule_type: string;
    parameters: any;
    active: boolean;
}

export interface DataLineage {
    id: string;
    source_asset_id: string;
    target_asset_id: string;
    transformation_type?: string;
    description?: string;
    source_asset?: DataAsset;
    target_asset?: DataAsset;
}

export const governanceService = {
    // --- Data Catalog ---
    async getAssets() {
        const { data, error } = await supabase
            .from('data_assets')
            .select(`
                *,
                owner:employees(full_name),
                definitions:data_definitions(*)
            `)
            .order('name');
        if (error) throw error;

        // Auto-seed with Schema if empty (User Request: "Catalog should be with respect to data in database")
        if (!data || data.length === 0) {
            console.log('Seeding Data Catalog with actual DB tables...');
            const dbTables = [
                { name: 'employees', type: 'Table', source: 'Postgres', sensitivity_level: 'Confidential', description: 'Master employee records including personal info, salary, and department.', tags: ['HR', 'Core'] },
                { name: 'departments', type: 'Table', source: 'Postgres', sensitivity_level: 'Internal', description: 'Organizational departments and budget codes.', tags: ['HR', 'Finance'] },
                { name: 'locations', type: 'Table', source: 'Postgres', sensitivity_level: 'Internal', description: 'Physical office locations and addresses.', tags: ['Operations'] },
                { name: 'documents', type: 'Table', source: 'Postgres', sensitivity_level: 'Confidential', description: 'Uploaded policy documents and contracts.', tags: ['Legal', 'GRC'] },
                { name: 'risks', type: 'Table', source: 'Postgres', sensitivity_level: 'Restricted', description: 'Enterprise risk registry and impact analysis.', tags: ['GRC', 'Risk'] },
                { name: 'programs', type: 'Table', source: 'Postgres', sensitivity_level: 'Internal', description: 'Compliance programs and initiatives.', tags: ['GRC'] },
                { name: 'cases_list', type: 'Table', source: 'Postgres', sensitivity_level: 'Confidential', description: 'Investigative cases and incident reports.', tags: ['Legal', 'Security'] },
                { name: 'app_roles', type: 'Table', source: 'Postgres', sensitivity_level: 'Internal', description: 'RBAC roles definition.', tags: ['IAM', 'Security'] },
                { name: 'app_permissions', type: 'Table', source: 'Postgres', sensitivity_level: 'Internal', description: 'Granular system permissions.', tags: ['IAM', 'Security'] },
                { name: 'audit_logs', type: 'Table', source: 'Postgres', sensitivity_level: 'Restricted', description: 'System access and activity logs.', tags: ['Audit', 'Security'] }
            ];

            const { data: seeded, error: seedError } = await supabase
                .from('data_assets')
                .insert(dbTables)
                .select(`
                    *,
                    owner:employees(full_name),
                    definitions:data_definitions(*)
                `);

            if (seedError) {
                console.error('Error auto-seeding catalog:', seedError);
                return [];
            }
            return seeded;
        }

        return data;
    },

    async getAssetById(id: string) {
        const { data, error } = await supabase
            .from('data_assets')
            .select(`
                *,
                owner:employees(full_name),
                definitions:data_definitions(*)
            `)
            .eq('id', id)
            .single();
        if (error) throw error;
        return data;
    },

    async createAsset(asset: Partial<DataAsset>) {
        const { data, error } = await supabase
            .from('data_assets')
            .insert(asset)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async updateAsset(id: string, updates: Partial<DataAsset>) {
        const { data, error } = await supabase
            .from('data_assets')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // --- Lineage ---
    async getLineage() {
        const { data, error } = await supabase
            .from('data_lineage')
            .select(`
                *,
                source_asset:data_assets!source_asset_id(name, type),
                target_asset:data_assets!target_asset_id(name, type)
            `);
        if (error) throw error;
        return data;
    },

    async createLineage(lineage: Partial<DataLineage>) {
        const { data, error } = await supabase
            .from('data_lineage')
            .insert(lineage)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    // --- Quality ---
    async getQualityRules() {
        const { data, error } = await supabase
            .from('data_quality_rules')
            .select(`
                *,
                asset:data_assets(name)
            `);
        if (error) throw error;
        return data;
    },

    async getQualityLogs() {
        const { data, error } = await supabase
            .from('data_quality_logs')
            .select(`
                *,
                rule:data_quality_rules(rule_name, asset:data_assets(name))
            `)
            .order('checked_at', { ascending: false })
            .limit(100);
        if (error) throw error;
        return data;
    },

    // --- Audit ---
    async getAuditLogs() {
        const { data, error } = await supabase
            .from('access_audit_logs')
            .select(`
                *,
                user:employees(full_name, email)
            `)
            .order('timestamp', { ascending: false })
            .limit(100);
        if (error) throw error;
        return data;
    }
};
