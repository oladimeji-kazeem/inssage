import { supabase } from '../lib/supabase';
// Ensure env vars are loaded in Node environment
import * as dotenv from 'dotenv';
dotenv.config();

const verifyAnalytics = async () => {
    console.log('Verifying Analytics Tables...');

    const tables = ['analytics_kpis', 'analytics_trends', 'analytics_categories', 'analytics_complex'];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error) {
            console.error(`Error checking ${table}:`, error.message);
        } else {
            console.log(`${table}: ${count} rows`);
        }
    }
};

verifyAnalytics();
