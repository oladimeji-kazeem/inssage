import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://atojjjivxmadmzgaokyi.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0b2pqaml2eG1hZG16Z2Fva3lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ3NjQxNDUsImV4cCI6MjA4MDM0MDE0NX0.Kw1jlRMywR6yZFnTilS6dKn6TJRlgmJNrqRfDDwT03c';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectSchema() {
    console.log('Connecting to Supabase...');

    // Try to list tables by querying information_schema if possible, or just guess common tables
    // Since we can't query information_schema easily with js client for some setups, we will try to select from likely tables.

    // Better approach for JS Client: we can't really "list tables" easily without SQL editor access or a specific function.
    // BUT the user said "It contains all the datasets required". 
    // I will try to fetch a few rows from likely table names based on my UI:
    // 'policies', 'documents', 'users', 'logs', 'audit_logs', 'prompts', 'integrations', 'workflows'

    const tablesToCheck = [
        'documents',
        'policies',
        'prompts',
        'integrations',
        'workflows',
        'audit_logs',
        'logs',
        'analytics',
        'profiles',
        'users'
    ];

    for (const table of tablesToCheck) {
        const { data, error } = await supabase.from(table).select('*').limit(1);

        if (error) {
            console.log(`[${table}] Error or not found: ${error.message} (Code: ${error.code})`);
        } else {
            console.log(`\n[${table}] Found! Sample row keys:`);
            if (data && data.length > 0) {
                console.log(Object.keys(data[0]).join(', '));
            } else {
                console.log('Table exists but is empty.');
            }
        }
    }
}

inspectSchema();
