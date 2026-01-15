-- Enterprise GRC Schema
-- RESET (Dev Only): Drop tables to ensure clean slate with new constraints
drop table if exists risk_controls cascade;
drop table if exists audit_findings cascade;
drop table if exists risks cascade;
drop table if exists controls cascade;
drop table if exists internal_audits cascade;
drop table if exists compliance_policies cascade;

-- 1. Risk Management
create table if not exists risks (
    id uuid default uuid_generate_v4() primary key,
    risk_id text not null unique, -- e.g. 'R-001'
    title text not null,
    description text,
    category text check (category in ('Cybersecurity', 'Financial', 'Operational', 'Legal', 'Strategic')),
    likelihood int check (likelihood between 1 and 5),
    impact int check (impact between 1 and 5),
    status text check (status in ('Open', 'Mitigated', 'Accepted', 'Closed')),
    owner text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists controls (
    id uuid default uuid_generate_v4() primary key,
    control_code text not null unique, -- e.g. 'AC-1'
    name text not null,
    description text,
    type text check (type in ('Preventive', 'Detective', 'Corrective')),
    effectiveness text check (effectiveness in ('Effective', 'Ineffective', 'Needs Improvement')),
    frequency text check (frequency in ('Daily', 'Weekly', 'Monthly', 'Quarterly', 'Annual')),
    last_tested date,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists risk_controls (
    risk_id uuid references risks(id) on delete cascade,
    control_id uuid references controls(id) on delete cascade,
    primary key (risk_id, control_id)
);

-- 2. Internal Audit
create table if not exists internal_audits (
    id uuid default uuid_generate_v4() primary key,
    audit_code text not null unique,
    title text not null, -- e.g. 'Q2 Financial Audit'
    scope text,
    status text check (status in ('Planned', 'In Progress', 'Completed', 'Cancelled')),
    auditor text,
    start_date date,
    end_date date,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

create table if not exists audit_findings (
    id uuid default uuid_generate_v4() primary key,
    audit_id uuid references internal_audits(id) on delete cascade,
    finding_code text unique, -- e.g. 'AF-001'
    description text not null,
    severity text check (severity in ('Critical', 'High', 'Medium', 'Low')),
    status text check (status in ('Open', 'Closed', 'Remediated')),
    owner text,
    remediation_due_date date,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Compliance
create table if not exists compliance_policies (
    id uuid default uuid_generate_v4() primary key,
    policy_code text not null unique, -- e.g. 'POL-Sec-01'
    title text not null,
    version text default '1.0',
    status text check (status in ('Draft', 'Active', 'Retired', 'Under Review')),
    last_review_date date,
    next_review_date date,
    owner text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS Policies (Public for Demo/Dev)
alter table risks enable row level security;
alter table controls enable row level security;
alter table risk_controls enable row level security;
alter table internal_audits enable row level security;
alter table audit_findings enable row level security;
alter table compliance_policies enable row level security;

drop policy if exists "Public Select Risks" on risks;
drop policy if exists "Public Insert Risks" on risks;
drop policy if exists "Public Update Risks" on risks;
drop policy if exists "Public Delete Risks" on risks;

create policy "Public Select Risks" on risks for select to public using (true);
create policy "Public Insert Risks" on risks for insert to public with check (true);
create policy "Public Update Risks" on risks for update to public using (true);
create policy "Public Delete Risks" on risks for delete to public using (true);

drop policy if exists "Public Select Controls" on controls;
drop policy if exists "Public Insert Controls" on controls;

create policy "Public Select Controls" on controls for select to public using (true);
create policy "Public Insert Controls" on controls for insert to public with check (true);

drop policy if exists "Public Select RiskControls" on risk_controls;
drop policy if exists "Public Insert RiskControls" on risk_controls;

create policy "Public Select RiskControls" on risk_controls for select to public using (true);
create policy "Public Insert RiskControls" on risk_controls for insert to public with check (true);

-- Ensure permissions are granted for public role (Dev/Demo Mode)
grant all on risks to public;
grant all on controls to public;
grant all on risk_controls to public;
grant all on internal_audits to public;
grant all on audit_findings to public;
grant all on compliance_policies to public;


drop policy if exists "Public Select Audits" on internal_audits;
drop policy if exists "Public Insert Audits" on internal_audits;

create policy "Public Select Audits" on internal_audits for select to public using (true);
create policy "Public Insert Audits" on internal_audits for insert to public with check (true);

drop policy if exists "Public Select Findings" on audit_findings;
drop policy if exists "Public Insert Findings" on audit_findings;

create policy "Public Select Findings" on audit_findings for select to public using (true);
create policy "Public Insert Findings" on audit_findings for insert to public with check (true);

drop policy if exists "Public Select Policies" on compliance_policies;
drop policy if exists "Public Insert Policies" on compliance_policies;

create policy "Public Select Policies" on compliance_policies for select to public using (true);
create policy "Public Insert Policies" on compliance_policies for insert to public with check (true);
