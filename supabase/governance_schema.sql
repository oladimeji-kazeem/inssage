-- User Management & Governance Schema

-- 1. USER MANAGEMENT (RBAC)

-- Roles
create table if not exists app_roles (
    id uuid default uuid_generate_v4() primary key,
    name text not null unique,
    description text,
    is_system_role boolean default false, -- e.g. 'Super Admin' cannot be deleted
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Permissions (Granular, e.g., 'users.create', 'reports.view')
create table if not exists app_permissions (
    id uuid default uuid_generate_v4() primary key,
    code text not null unique, -- e.g. 'users.read'
    description text,
    module text, -- e.g. 'User Management', 'Governance'
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Role <-> Permissions
create table if not exists role_permissions (
    role_id uuid references app_roles(id) on delete cascade,
    permission_id uuid references app_permissions(id) on delete cascade,
    primary key (role_id, permission_id)
);

-- App Modules (High-level features, e.g. 'Control Plane', 'Governance')
create table if not exists app_modules (
    id uuid default uuid_generate_v4() primary key,
    key text not null unique, -- e.g. 'governance'
    name text not null,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Role <-> Modules (Access Control at Module Level)
create table if not exists role_modules (
    role_id uuid references app_roles(id) on delete cascade,
    module_id uuid references app_modules(id) on delete cascade,
    primary key (role_id, module_id)
);

-- Employee <-> Roles (User Assignment)
create table if not exists employee_roles (
    employee_id uuid references employees(id) on delete cascade,
    role_id uuid references app_roles(id) on delete cascade,
    assigned_at timestamp with time zone default timezone('utc'::text, now()),
    primary key (employee_id, role_id)
);

-- Link Employees to Auth Users (Optional, but recommended for real login)
-- Note: 'user_id' column should be added to 'employees' table via migration in prod.
-- For this script, we assume it might need to be added or utilized.
-- alter table employees add column if not exists user_id uuid references auth.users(id);

-- 2. GOVERNANCE MODULE

-- Data Assets (Catalog)
create table if not exists data_assets (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    type text check (type in ('Table', 'View', 'API', 'Report', 'S3 Bucket')),
    source text, -- e.g. 'Postgres', 'Salesforce'
    owner_id uuid references employees(id) on delete set null,
    sensitivity_level text check (sensitivity_level in ('Public', 'Internal', 'Confidential', 'Restricted')),
    description text,
    tags text[],
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Data Definitions (Schema/Fields)
create table if not exists data_definitions (
    id uuid default uuid_generate_v4() primary key,
    asset_id uuid references data_assets(id) on delete cascade,
    field_name text not null,
    data_type text,
    is_pii boolean default false,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Data Lineage (Flow)
create table if not exists data_lineage (
    id uuid default uuid_generate_v4() primary key,
    source_asset_id uuid references data_assets(id) on delete cascade,
    target_asset_id uuid references data_assets(id) on delete cascade,
    transformation_type text, -- e.g. 'ETL', 'Direct Copy', 'Aggregation'
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Data Quality Rules
create table if not exists data_quality_rules (
    id uuid default uuid_generate_v4() primary key,
    asset_id uuid references data_assets(id) on delete cascade,
    rule_name text not null,
    rule_type text check (rule_type in ('Completeness', 'Accuracy', 'Consistency', 'Freshness')),
    parameters jsonb, -- e.g. { "min_value": 0, "pattern": "^[A-Z]" }
    active boolean default true,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Data Quality Logs (Monitoring Results)
create table if not exists data_quality_logs (
    id uuid default uuid_generate_v4() primary key,
    rule_id uuid references data_quality_rules(id) on delete cascade,
    status text check (status in ('Pass', 'Fail', 'Warning')),
    value text, -- Measured value, e.g. '98.5%' or '15 nulls'
    message text,
    checked_at timestamp with time zone default timezone('utc'::text, now())
);

-- Access Audit Logs (Policy Enforcement)
create table if not exists access_audit_logs (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references employees(id) on delete set null, -- Tracking the employee (proxy for user)
    action text not null, -- e.g. 'VIEW', 'EXPORT', 'DELETE'
    resource_type text, -- e.g. 'Data Asset', 'Employee Record'
    resource_id text, -- ID of the accessed resource
    details jsonb,
    ip_address text,
    timestamp timestamp with time zone default timezone('utc'::text, now())
);


-- RLS POLICIES (Dev Mode: Public Access for simplicity, can be tightened later)

-- User Management RLS
alter table app_roles enable row level security;
alter table app_permissions enable row level security;
alter table role_permissions enable row level security;
alter table app_modules enable row level security;
alter table role_modules enable row level security;
alter table employee_roles enable row level security;

create policy "Public Access Roles" on app_roles for select to public using (true);
create policy "Public Modify Roles" on app_roles for all to public using (true);

create policy "Public Access Permissions" on app_permissions for select to public using (true);
create policy "Public Modify Permissions" on app_permissions for all to public using (true);

create policy "Public Access RolePerms" on role_permissions for select to public using (true);
create policy "Public Modify RolePerms" on role_permissions for all to public using (true);

create policy "Public Access Modules" on app_modules for select to public using (true);
create policy "Public Modify Modules" on app_modules for all to public using (true);

create policy "Public Access RoleModules" on role_modules for select to public using (true);
create policy "Public Modify RoleModules" on role_modules for all to public using (true);

create policy "Public Access EmpRoles" on employee_roles for select to public using (true);
create policy "Public Modify EmpRoles" on employee_roles for all to public using (true);


-- Governance RLS
alter table data_assets enable row level security;
alter table data_definitions enable row level security;
alter table data_lineage enable row level security;
alter table data_quality_rules enable row level security;
alter table data_quality_logs enable row level security;
alter table access_audit_logs enable row level security;

create policy "Public Access Assets" on data_assets for select to public using (true);
create policy "Public Modify Assets" on data_assets for all to public using (true);

create policy "Public Access Definitions" on data_definitions for select to public using (true);
create policy "Public Modify Definitions" on data_definitions for all to public using (true);

create policy "Public Access Lineage" on data_lineage for select to public using (true);
create policy "Public Modify Lineage" on data_lineage for all to public using (true);

create policy "Public Access Rules" on data_quality_rules for select to public using (true);
create policy "Public Modify Rules" on data_quality_rules for all to public using (true);

create policy "Public Access QualityLogs" on data_quality_logs for select to public using (true);
create policy "Public Modify QualityLogs" on data_quality_logs for all to public using (true);

create policy "Public Access AuditLogs" on access_audit_logs for select to public using (true);
create policy "Public Modify AuditLogs" on access_audit_logs for all to public using (true); 
-- Audit logs should technically be append-only, but keeping flexible for dev.

-- Grant Permissions
grant all on app_roles to public;
grant all on app_permissions to public;
grant all on role_permissions to public;
grant all on app_modules to public;
grant all on role_modules to public;
grant all on employee_roles to public;

grant all on data_assets to public;
grant all on data_definitions to public;
grant all on data_lineage to public;
grant all on data_quality_rules to public;
grant all on data_quality_logs to public;
grant all on access_audit_logs to public;

-- Initial Seed Data (Optional)
insert into app_roles (name, description, is_system_role) values
('Super Admin', 'Full access to everything', true),
('Data Steward', 'Manages data governance', false),
('Compliance Officer', 'Read access to audit logs and policies', false)
on conflict do nothing;

insert into app_modules (key, name, description) values
('control_plane', 'Control Plane', 'Main dashboard'),
('governance', 'Governance', 'Data catalog and lineage'),
('user_mgmt', 'User Management', 'Manage users and roles'),
('chat', 'Search Chats', 'AI Chat and Search'),
('documents', 'Documents', 'Document management'),
('prompts', 'Prompt Library', 'Manage AI prompts'),
('analytics', 'Analytics', 'System analytics and reports'),
('integrations', 'Integrations', 'Manage external integrations'),
('workflows', 'Workflows', 'Workflow automation'),
('meetings', 'Meeting Copilot', 'Meeting notes and summaries'),
('settings', 'Settings', 'System configuration')
on conflict do nothing;
