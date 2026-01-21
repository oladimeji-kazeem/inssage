-- Meetings Schema for Meeting Copilot

create table if not exists meetings (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    date timestamp with time zone not null,
    status text check (status in ('Scheduled', 'Live', 'Completed')),
    attendees text[], -- Array of names/roles e.g. ["Sarah Chen", "Mike"]
    summary_url text, -- Link to transcript/summary if exists
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- RLS
alter table meetings enable row level security;
create policy "Public Access Meetings" on meetings for select to public using (true);
create policy "Public Modify Meetings" on meetings for all to public using (true);
grant all on meetings to public;

-- Seed Data (Matching the Screenshot)
insert into meetings (title, date, status, attendees) values
('Client Strategy Session', '2026-01-20 14:14:00+00', 'Scheduled', ARRAY['Sarah Chen (HR Manager)', 'Oladimeji (Super Admin)']),
('Weekly Compliance Sync', '2026-01-19 13:29:00+00', 'Live', ARRAY['Sarah Chen', 'John Smith', 'Mike', 'Alex']),
('Product Roadmap Planning', '2026-01-18 14:14:00+00', 'Completed', ARRAY['David Kim (Product Owner)', 'Maria Garcia (Data Team)']),
('Weekly Governance Sync', '2026-01-16 14:14:00+00', 'Completed', ARRAY['Sarah Chen (HR Manager)', 'John Smith (Engineering)']),
('Q3 Security Audit Review', '2026-01-05 14:14:00+00', 'Completed', ARRAY['Alex Wong (Security Analyst)', 'Oladimeji (Super Admin)']),
('Urgent Incident Response: API Latency', '2025-12-19 14:14:00+00', 'Completed', ARRAY['John Smith (Engineering Lead)', 'David Kim (Product)']),
('Monthly All-Hands', '2025-12-17 14:14:00+00', 'Completed', ARRAY['All Employees']);
