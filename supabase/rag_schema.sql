
-- Add RAG support columns to documents table
alter table documents 
add column if not exists content text, -- Stores the raw text for RAG retrieval
add column if not exists embedding vector(1536); -- Stores OpenAI-compatible embeddings

-- Enable pgvector extension (idempotent)
create extension if not exists vector;

-- Seed some content for RAG demonstration
update documents 
set content = 'Employees are permitted to work remotely for up to 30 days per calendar year. Requests must be submitted 2 weeks in advance.' 
where title = 'Remote Work Policy';

update documents 
set content = 'All expenses over $50 require a receipt. Per diem rates are capped at $75/day for domestic travel.' 
where title = 'Travel & Expense Policy';

update documents 
set content = 'The Data Retention Policy requires specific handling of PII. Customer data must be encrypted at rest and deleted after 7 years of inactivity.' 
where title = 'Data Retention Policy';
