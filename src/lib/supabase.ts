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

let supabaseClient: any = null;

if (supabaseUrl && supabaseAnonKey) {
    try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    } catch (e) {
        console.warn('Failed to initialize Supabase client:', e);
    }
} else {
    console.warn('Supabase URL or Anon Key missing. App will run in mock mode.');
}

export const supabase = supabaseClient;
