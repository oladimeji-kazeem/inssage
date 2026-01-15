import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or Anon Key missing in environment variables (process.env)');
    process.exit(1);
}

export const supabaseScriptInfo = { url: supabaseUrl, key: supabaseAnonKey };
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
