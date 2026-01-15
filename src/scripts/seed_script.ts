import { supabase } from './client';

// Helper for random items
const random = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore'];
const cities = [
    { city: 'New York', state: 'NY' },
    { city: 'San Francisco', state: 'CA' },
    { city: 'Austin', state: 'TX' },
    { city: 'Chicago', state: 'IL' },
    { city: 'Miami', state: 'FL' }
];

async function seed() {
    console.log('Starting MANAUL database seed via script...');

    // 1. Locations
    const locationsData = cities.map(c => ({
        city: c.city,
        state: c.state,
        address: `${randomInt(100, 999)} Business Park Blvd`,
        country: 'USA'
    }));

    const { data: locations, error: locError } = await supabase.from('locations').insert(locationsData).select();
    if (locError) { console.error('Error seeding locations:', locError); return; }
    console.log(`Seeded ${locations.length} locations`);

    // 2. Departments
    const deptNames = ['Engineering', 'Sales', 'Marketing', 'Human Resources', 'Finance', 'Operations', 'Customer Support', 'IT'];
    const departmentsData = deptNames.map(name => ({
        name,
        budget: randomInt(500000, 5000000)
    }));

    const { data: departments, error: deptError } = await supabase.from('departments').insert(departmentsData).select();
    if (deptError) { console.error('Error seeding departments:', deptError); return; }
    console.log(`Seeded ${departments.length} departments`);

    // 3. Employees (1248 to match analytics)
    const employeesBatch = [];
    const TOTAL_EMPLOYEES = 1248;

    for (let i = 0; i < TOTAL_EMPLOYEES; i++) {
        const fn = random(firstNames);
        const ln = random(lastNames);
        const dept = random(departments);
        const loc = random(locations);
        const joinYear = randomInt(2018, 2024);

        employeesBatch.push({
            first_name: fn,
            last_name: ln,
            email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@inssage.com`,
            department_id: dept.id,
            location_id: loc.id,
            job_title: `${dept.name} ${random(['Specialist', 'Manager', 'Analyst', 'Director', 'Associate'])}`,
            status: randomInt(1, 100) > 95 ? 'Terminated' : 'Active', // 5% attrition approximately
            salary: randomInt(60000, 180000),
            gender: random(['Male', 'Female', 'Non-binary', 'Prefer not to say']),
            join_date: `${joinYear}-${randomInt(1, 12).toString().padStart(2, '0')}-${randomInt(1, 28).toString().padStart(2, '0')}`,
            performance_rating: (Math.random() * 2 + 3).toFixed(1) // 3.0 to 5.0
        });
    }

    // Insert in chunks of 500
    for (let i = 0; i < employeesBatch.length; i += 500) {
        const chunk = employeesBatch.slice(i, i + 500);
        const { error: empError } = await supabase.from('employees').insert(chunk);
        if (empError) console.error('Error seeding employees chunk:', empError);
    }
    console.log(`Successfully seeded ${TOTAL_EMPLOYEES} employees.`);
}

seed();
