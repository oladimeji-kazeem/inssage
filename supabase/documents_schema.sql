-- Documents & Employee GRC Schema

-- 0. RESET (Dev Only): Drop tables to ensure clean slate
drop table if exists document_acknowledgments cascade;
drop table if exists documents cascade;
drop table if exists employees cascade;

-- 1. Employees (People Assurance)
create table if not exists employees (
    id uuid default uuid_generate_v4() primary key,
    full_name text not null,
    email text unique not null,
    department text not null, -- e.g. 'Engineering', 'HR', 'Legal'
    role text not null, -- e.g. 'Senior Engineer', 'Compliance Officer'
    status text check (status in ('Active', 'On Leave', 'Terminated')) default 'Active',
    risk_score int default 0, -- Calculated risk score (0-100)
    last_security_training date,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Documents
create table if not exists documents (
    id uuid default uuid_generate_v4() primary key,
    title text not null unique,
    type text check (type in ('Policy', 'Procedure', 'Contract', 'Report', 'Evidence')),
    status text check (status in ('Draft', 'Active', 'Review Needed', 'Archived')) default 'Draft',
    risk_level text check (risk_level in ('Low', 'Medium', 'High', 'Critical')) default 'Low',
    owner_id uuid references employees(id) on delete set null,
    approver_id uuid references employees(id) on delete set null, -- New: Who approved this doc
    applicable_department text, -- New: e.g. 'All', 'Engineering', 'HR'
    file_url text, -- Placeholder for storage URL
    version text default '1.0',
    guardrails_count int default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Document Acknowledgments (New)
create table if not exists document_acknowledgments (
    id uuid default uuid_generate_v4() primary key,
    document_id uuid references documents(id) on delete cascade,
    employee_id uuid references employees(id) on delete cascade,
    acknowledged_at timestamp with time zone default timezone('utc'::text, now()),
    unique(document_id, employee_id) -- Prevent duplicate acks
);

-- RLS Policies (Public for Dev)
alter table employees enable row level security;
alter table documents enable row level security;
alter table document_acknowledgments enable row level security;

-- Drop existing policies if they exist (Fix for 42710)
drop policy if exists "Public Select Employees" on employees;
drop policy if exists "Public Insert Employees" on employees;
drop policy if exists "Public Update Employees" on employees;

drop policy if exists "Public Select Documents" on documents;
drop policy if exists "Public Insert Documents" on documents;
drop policy if exists "Public Update Documents" on documents;

drop policy if exists "Public Select Acks" on document_acknowledgments;
drop policy if exists "Public Insert Acks" on document_acknowledgments;


create policy "Public Select Employees" on employees for select to public using (true);
create policy "Public Insert Employees" on employees for insert to public with check (true);
create policy "Public Update Employees" on employees for update to public using (true);

create policy "Public Select Documents" on documents for select to public using (true);
create policy "Public Insert Documents" on documents for insert to public with check (true);
create policy "Public Update Documents" on documents for update to public using (true);

create policy "Public Select Acks" on document_acknowledgments for select to public using (true);
create policy "Public Insert Acks" on document_acknowledgments for insert to public with check (true);

-- Grant Permissions
grant all on employees to public;
grant all on documents to public;
grant all on document_acknowledgments to public;

-- 4. Storage Bucket Setup
insert into storage.buckets (id, name, public)
values ('documents', 'documents', true)
on conflict (id) do nothing;

-- Storage Policies (Public for Dev)
drop policy if exists "Public Access Documents" on storage.objects;
drop policy if exists "Public Upload Documents" on storage.objects;
drop policy if exists "Public Update Storage" on storage.objects;
drop policy if exists "Public Delete Storage" on storage.objects;


create policy "Public Access Documents"
on storage.objects for select
to public
using ( bucket_id = 'documents' );

create policy "Public Upload Documents"
on storage.objects for insert
to public
with check ( bucket_id = 'documents' );

create policy "Public Update Storage"
on storage.objects for update
to public
using ( bucket_id = 'documents' );

create policy "Public Delete Storage"
on storage.objects for delete
to public
using ( bucket_id = 'documents' );
