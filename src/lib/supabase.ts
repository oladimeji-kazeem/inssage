import { createClient } from '@supabase/supabase-js';

// Safe access to environment variables for both Vite (Browser) and Node.js (Scripts)
const getEnvVar = (key: string) => {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        return import.meta.env[key];
    }
    if (typeof process !== 'undefined' && process.env) {
        return process.env[key];
    }
    return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key missing in environment variables');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');
