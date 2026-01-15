import { analyticsService } from '../services/analyticsService';
import { supabase } from '../lib/supabase';
// Ensure env vars are loaded in Node environment
import * as dotenv from 'dotenv';
dotenv.config();

const runSeeding = async () => {
    console.log('Starting Analytics Seeding...');
    try {
        console.log('Checking connection...');
        const { count, error } = await supabase.from('employees').select('*', { count: 'exact', head: true });
        if (error) {
            console.error('Connection failed:', error.message);
            throw error;
        }
        console.log(`Connected. Found ${count} employees.`);

        console.log('Running seedData()...');
        await analyticsService.seedData();
        console.log('Seeding completed successfully.');
    } catch (err: any) {
        console.error('Seeding failed:', err.message || err);
    }
};

runSeeding();
