-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. KPI Cards Table (Single values with trends)
create table if not exists analytics_kpis (
    id uuid default uuid_generate_v4() primary key,
    category text not null, -- 'hris', 'recruitment', 'performance', 'payroll', 'sentiments', 'requests'
    label text not null,
    value text not null, -- Store as text to allow formatting like '$495,000' or '88%'
    unit text,
    trend_value text, -- e.g. '3.1%'
    trend_direction text check (trend_direction in ('up', 'down', 'neutral')),
    trend_label text, -- e.g. 'vs last month'
    icon text, -- Lucide icon name
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Time Series / Trend Data (Line/Area charts)
create table if not exists analytics_trends (
    id uuid default uuid_generate_v4() primary key,
    category text not null,
    chart_id text not null, -- e.g. 'headcount_trend', 'payroll_trend'
    period text not null, -- 'Jan', 'Feb', 'W1', etc.
    series_name text default 'default', -- For multi-line charts (e.g. 'budget' vs 'actual')
    value numeric not null,
    extra_value numeric, -- For charts with secondary metrics (e.g. overtime in payroll)
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Categorical / Distribution Data (Pie/Bar charts)
create table if not exists analytics_categories (
    id uuid default uuid_generate_v4() primary key,
    category text not null,
    chart_id text not null, -- e.g. 'dept_distribution', 'source_of_hire'
    label text not null, -- The category name (e.g. 'Engineering', 'LinkedIn')
    value numeric not null,
    color text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Multi-Dimensional / Complex Data (Scatter plots, Radar charts)
create table if not exists analytics_complex_data (
    id uuid default uuid_generate_v4() primary key,
    category text not null,
    chart_id text not null, -- e.g. 'performance_vs_tenure', 'talent_matrix'
    data_point jsonb not null, -- Flexible storage for things like {x: 1, y: 2, label: 'John'}
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Row Level Security (RLS) - Basic Policy
alter table analytics_kpis enable row level security;
alter table analytics_trends enable row level security;
alter table analytics_categories enable row level security;
alter table analytics_complex_data enable row level security;

-- Allow read access to all authenticated users
-- Allow read access to all users (public)
create policy "Allow read access to all users"
on analytics_kpis for select
to public
using (true);

create policy "Allow read access to all users"
on analytics_trends for select
to public
using (true);

create policy "Allow read access to all users"
on analytics_categories for select
to public
using (true);

create policy "Allow read access to all users"
on analytics_complex_data for select
to public
using (true);

-- Allow insert access to all users (public - for auto-seeding)
create policy "Allow insert access to all users"
on analytics_kpis for insert
to public
with check (true);

create policy "Allow insert access to all users"
on analytics_trends for insert
to public
with check (true);

create policy "Allow insert access to all users"
on analytics_categories for insert
to public
with check (true);

create policy "Allow insert access to all users"
on analytics_complex_data for insert
to public
with check (true);
