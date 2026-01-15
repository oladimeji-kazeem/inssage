import { supabase } from './client';

async function verify() {
    console.log('Verifying database data...');

    const { count: empCount, error: empError } = await supabase
        .from('employees')
        .select('*', { count: 'exact', head: true });

    if (empError) {
        console.error('Error fetching employees count:', empError.message);
        process.exit(1);
    }

    const { count: locCount, error: locError } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true });

    if (locError) {
        console.error('Error fetching locations count:', locError.message);
    }

    console.log(`Employees Count: ${empCount}`);
    console.log(`Locations Count: ${locCount}`);

    if ((empCount || 0) > 1000) {
        console.log('VERIFICATION_SUCCESS: Data appears to be populated.');
    } else {
        console.log('VERIFICATION_PENDING: Data missing or insufficient.');
    }
}

verify();
