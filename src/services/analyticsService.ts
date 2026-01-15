import { supabase } from '../lib/supabase';

// Types matching our schema
export interface AnalyticsKPI {
    category: string;
    label: string;
    value: string;
    unit?: string;
    trend_value?: string;
    trend_direction?: 'up' | 'down' | 'neutral';
    trend_label?: string;
    icon?: string;
}

export interface AnalyticsTrend {
    category: string;
    chart_id: string;
    period: string; // X-axis label
    series_name?: string;
    value: number;
    extra_value?: number;
}

export interface AnalyticsCategory {
    category: string;
    chart_id: string;
    label: string;
    value: number;
    color?: string;
}

export interface AnalyticsComplex {
    category: string;
    chart_id: string;
    data_point: any;
}

export const analyticsService = {
    // Fetch Methods
    async getKPIs(category: string) {
        const { data, error } = await supabase
            .from('analytics_kpis')
            .select('*')
            .eq('category', category);
        if (error) throw error;

        // Deduplicate based on label (Last One Wins)
        const uniqueMap = new Map();
        data.forEach((item: any) => {
            uniqueMap.set(item.label, item);
        });
        const uniqueData = Array.from(uniqueMap.values());

        // Map DB 'trend' column back to 'trend_value' for frontend interface
        return uniqueData.map((d: any) => ({
            ...d,
            trend_value: d.trend, // DB has 'trend', Interface expects 'trend_value'
            trend_label: d.icon   // WORKAROUND: Schema lacks 'trend_label', so we stored it in 'icon'
        }));
    },

    async getTrends(chartId: string) {
        const { data, error } = await supabase
            .from('analytics_trends')
            .select('*')
            .eq('chart_id', chartId)
            .order('period', { ascending: true });
        if (error) throw error;

        // Chronological Sort Helper
        const monthOrder: { [key: string]: number } = {
            'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
            'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12,
            'Q1': 1, 'Q2': 2, 'Q3': 3, 'Q4': 4,
            'W1': 1, 'W2': 2, 'W3': 3, 'W4': 4
        };

        // Aggregation: If we have multiple values for the same period (duplicates), take the average or the latest?
        // Since it's trend data (snapshot), taking the LAST entered series usually makes sense if they are duplicates.
        // Actually, let's Map by period and just take the last one seen.
        const uniqueMap = new Map();
        data.forEach((item: any) => {
            uniqueMap.set(item.period, item);
        });
        const uniqueData = Array.from(uniqueMap.values());

        // Sort
        return uniqueData.sort((a: any, b: any) => {
            const orderA = monthOrder[a.period] || 99;
            const orderB = monthOrder[b.period] || 99;
            return orderA - orderB;
        });
    },

    async getCategories(chartId: string) {
        const { data, error } = await supabase
            .from('analytics_categories')
            .select('*')
            .eq('chart_id', chartId);
        if (error) throw error;

        // Deduplicate based on label (Last One Wins)
        const uniqueMap = new Map();
        data.forEach((item: any) => {
            uniqueMap.set(item.label, item);
        });
        const uniqueData = Array.from(uniqueMap.values());

        return uniqueData;
    },

    async getComplexData(chartId: string) {
        const { data, error } = await supabase
            .from('analytics_complex')
            .select('*')
            .eq('chart_id', chartId);
        if (error) throw error;
        return data.map(d => d.data); // Return the 'data' JSONB column content
    },

    async getKeyResults() {
        const { data, error } = await supabase
            .from('key_results')
            .select(`
                *,
                goal:goals(title)
            `);
        if (error) throw error;
        return data;
    },

    async ensurePerformanceData() {
        // FORCE RESET for debugging: Delete then Insert
        console.log('Force Reseeding Performance vs Tenure Data...');
        await supabase.from('analytics_complex').delete().eq('chart_id', 'performance_vs_tenure');

        // REAL AGGREGATION: Fetch from Performance Reviews & Employees
        console.log('Aggregating Performance vs Tenure from Real Tables...');
        const { data: reviews } = await supabase.from('performance_reviews')
            .select('rating, employee:employees(join_date, first_name, last_name)');

        let complexData = [];
        if (reviews && reviews.length > 0) {
            complexData = reviews.map((r: any, i: number) => {
                const joinDate = new Date(r.employee?.join_date || '2020-01-01');
                const now = new Date();
                const tenure = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
                return {
                    category: 'hris',
                    chart_id: 'performance_vs_tenure',
                    data: {
                        tenure: tenure || 1,
                        performance: parseFloat(r.rating || 3),
                        name: `${r.employee?.first_name || 'Emp'} ${r.employee?.last_name?.[0] || i}`
                    }
                };
            });
        } else {
            // Fallback if no real data found (should not happen after seedEnterpriseData)
            complexData = Array.from({ length: 30 }).map((_, i) => ({
                category: 'hris',
                chart_id: 'performance_vs_tenure',
                data: {
                    tenure: Math.floor(Math.random() * 10) + 1,
                    performance: (Math.random() * 2 + 3).toFixed(1),
                    name: `Emp ${i}`
                }
            }));
        }
        if (complexData.length > 0) {
            await supabase.from('analytics_complex').insert(complexData);
        }
    },

    async ensureSkillsGapData() {
        console.log('Aggregating Skills Gap from Real Tables...');
        const { data: skills } = await supabase.from('employee_skills')
            .select('proficiency_level, skill:skills(name, category)');

        if (skills && skills.length > 0) {
            const skillMap = new Map();
            skills.forEach(((s: any) => {
                const name = s.skill?.name || 'Unknown';
                if (!skillMap.has(name)) {
                    skillMap.set(name, { sum: 0, count: 0 });
                }
                const entry = skillMap.get(name);
                entry.sum += s.proficiency_level;
                entry.count++;
            }));

            const chartData = Array.from(skillMap.entries()).slice(0, 6).map(([subject, stats]) => ({
                subject,
                A: parseFloat((stats.sum / stats.count).toFixed(1)), // Actual
                B: 5, // Target/Required
                fullMark: 5
            }));

            // Update analytics_categories or charts that use this. 
            // Note: The UI for Radar might expect specific JSON struct. 
            // For now, let's store it in `analytics_complex` as 'skill_gap'
            await supabase.from('analytics_complex').delete().eq('chart_id', 'skill_gap');
            const complexEntry = {
                category: 'performance', // or L&D
                chart_id: 'skill_gap',
                data: { radarData: chartData } // Wrap it
            };
            await supabase.from('analytics_complex').insert(complexEntry);
        }
    },

    async ensureAbsenteeismData() {
        console.log('Aggregating Absenteeism from Real Tables...');
        // Simple calc: Count leave days per month
        const { data: leaves } = await supabase.from('leave_requests')
            .select('start_date, end_date')
            .eq('status', 'Approved');

        if (leaves && leaves.length > 0) {
            const monthMap = new Map();
            leaves.forEach((l: any) => {
                const month = new Date(l.start_date).toLocaleString('default', { month: 'short' });
                monthMap.set(month, (monthMap.get(month) || 0) + 1);
            });

            const trendData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map(m => ({
                category: 'hris',
                chart_id: 'absenteeism_trend',
                period: m,
                value: monthMap.get(m) || Math.floor(Math.random() * 2), // Fallback to low random if empty month
                extra_value: 5 // Target max
            }));

            await supabase.from('analytics_trends').delete().eq('chart_id', 'absenteeism_trend');
            await supabase.from('analytics_trends').insert(trendData);
        }

        // Training Impact
        console.log('Aggregating Training Impact...');
        const { data: training } = await supabase.from('training_completions')
            .select('score, training:trainings(duration_hours)');

        if (training && training.length > 0) {
            // Mock impact correlation
            const impactData = [
                { name: 'Security', hours: 2, score: 3.8 },
                { name: 'Gdpr', hours: 4, score: 4.1 },
                { name: 'React', hours: 20, score: 4.5 },
                { name: 'Mgmt', hours: 40, score: 4.2 }
            ];
            await supabase.from('analytics_complex').delete().eq('chart_id', 'training_impact');
            await supabase.from('analytics_complex').insert({
                category: 'performance',
                chart_id: 'training_impact',
                data: { composedData: impactData }
            });
        }
    },

    async ensureRecruitmentData() {
        // Check and Seed Rejection Reasons
        const { count: rejCount } = await supabase.from('analytics_complex')
            .select('*', { count: 'exact', head: true })
            .eq('chart_id', 'rejection_reasons');

        if (!rejCount || rejCount === 0) {
            console.log('Seeding Rejection Reasons...');
            const reasons = [
                { reason: 'Salary Expectation', count: 45 },
                { reason: 'Better Offer', count: 32 },
                { reason: 'Location/Commute', count: 28 },
                { reason: 'Culture Fit', count: 15 },
                { reason: 'Role Mismatch', count: 12 },
                { reason: 'Timing', count: 8 }
            ].map(d => ({
                category: 'recruitments',
                chart_id: 'rejection_reasons',
                data: d
            }));
            await supabase.from('analytics_complex').insert(reasons);
        }

        // Check and Seed Quality of Hire Trend
        const { count: qualCount } = await supabase.from('analytics_complex')
            .select('*', { count: 'exact', head: true })
            .eq('chart_id', 'quality_of_hire_trend');

        if (!qualCount || qualCount === 0) {
            console.log('Seeding Quality of Hire Trend...');
            const trend = [
                { period: 'Jan', value: 78 },
                { period: 'Feb', value: 80 },
                { period: 'Mar', value: 79 },
                { period: 'Apr', value: 82 },
                { period: 'May', value: 85 },
                { period: 'Jun', value: 84 }
            ].map(d => ({
                category: 'recruitments',
                chart_id: 'quality_of_hire_trend',
                data: d
            }));
            await supabase.from('analytics_complex').insert(trend);
        }
    },

    // NEW: Enterprise Data Seeding (Real Tables)
    async seedEnterpriseData() {
        console.log('Checking Enterprise Data Tables...');

        // 1. Jobs & Applicants
        const { count: jobCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
        if (!jobCount || jobCount === 0) {
            console.log('Seeding Jobs...');
            const { data: depts } = await supabase.from('departments').select('id');
            const { data: locs } = await supabase.from('locations').select('id');

            if (depts && depts.length > 0 && locs && locs.length > 0) {
                const jobs = Array.from({ length: 50 }).map((_, i) => ({
                    title: `Role ${i + 1}`,
                    department_id: depts[i % depts.length].id,
                    location_id: locs[i % locs.length].id,
                    status: Math.random() > 0.3 ? 'Open' : 'Closed'
                }));
                const { data: createdJobs } = await supabase.from('jobs').insert(jobs).select();

                if (createdJobs) {
                    console.log('Seeding Applicants (High Volume)...');
                    const applicants = createdJobs.flatMap(job =>
                        Array.from({ length: Math.floor(Math.random() * 40) + 10 }).map(() => ({
                            job_id: job.id,
                            first_name: 'Cand',
                            last_name: `User${Math.floor(Math.random() * 1000)}`,
                            email: `candidate${Math.floor(Math.random() * 10000)}@example.com`,
                            stage: ['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'][Math.floor(Math.random() * 5)]
                        }))
                    );
                    await supabase.from('applicants').insert(applicants);
                }
            }
        }

        // 2. Performance Reviews
        const { count: reviewCount } = await supabase.from('performance_reviews').select('*', { count: 'exact', head: true });
        if (!reviewCount || reviewCount === 0) {
            console.log('Seeding Performance Reviews...');
            const { data: emps } = await supabase.from('employees').select('id');
            if (emps && emps.length > 0) {
                const reviews = emps.map(e => ({
                    employee_id: e.id,
                    review_period: '2023-Q4',
                    rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
                    status: 'Completed',
                    completed_at: new Date().toISOString()
                }));
                await supabase.from('performance_reviews').insert(reviews);
            }
        }

        // 3. Payroll Records
        const { count: payCount } = await supabase.from('payroll_records').select('*', { count: 'exact', head: true });
        if (!payCount || payCount === 0) {
            console.log('Seeding Payroll Records...');
            const { data: emps } = await supabase.from('employees').select('id, salary');
            if (emps && emps.length > 0) {
                const records = emps.map(e => ({
                    employee_id: e.id,
                    pay_period: '2024-01-01',
                    base_salary: (e.salary || 60000) / 12,
                    net_pay: ((e.salary || 60000) / 12) * 0.8
                }));
                await supabase.from('payroll_records').insert(records);
            }
        }

        // 4. Leave Management
        const { count: leaveCount } = await supabase.from('leave_types').select('*', { count: 'exact', head: true });
        if (!leaveCount || leaveCount === 0) {
            console.log('Seeding Leave Types & Requests...');
            const types = [
                { name: 'Vacation', days_allowed: 20 },
                { name: 'Sick Leave', days_allowed: 10 },
                { name: 'Personal', days_allowed: 5 },
                { name: 'Maternity/Paternity', days_allowed: 90 }
            ];
            const { data: createdTypes } = await supabase.from('leave_types').insert(types).select();

            if (createdTypes) {
                const { data: emps } = await supabase.from('employees').select('id');
                if (emps && emps.length > 0) {
                    const requests = emps.flatMap(e => {
                        return Array.from({ length: Math.floor(Math.random() * 8) + 4 }).map(() => {
                            const type = createdTypes[Math.floor(Math.random() * createdTypes.length)];
                            const start = new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28));
                            const end = new Date(start);
                            end.setDate(start.getDate() + Math.floor(Math.random() * 5) + 1);
                            return {
                                employee_id: e.id,
                                leave_type_id: type.id,
                                start_date: start.toISOString(),
                                end_date: end.toISOString(),
                                status: 'Approved',
                                reason: 'Annual Leave'
                            };
                        });
                    });
                    await supabase.from('leave_requests').insert(requests);
                }
            }
        }

        // 5. Skills Matrix
        const { count: skillCount } = await supabase.from('skills').select('*', { count: 'exact', head: true });
        if (!skillCount || skillCount === 0) {
            console.log('Seeding Skills & Assignments...');
            const skillsList = [
                { name: 'React', category: 'Technical' }, { name: 'Node.js', category: 'Technical' },
                { name: 'Python', category: 'Technical' }, { name: 'SQL', category: 'Technical' },
                { name: 'Project Management', category: 'Soft' }, { name: 'Leadership', category: 'Soft' },
                { name: 'Public Speaking', category: 'Soft' }, { name: 'Strategic Planning', category: 'Soft' },
                { name: 'Figma', category: 'Design' }, { name: 'UI/UX', category: 'Design' }
            ];
            const { data: createdSkills } = await supabase.from('skills').insert(skillsList).select();

            if (createdSkills) {
                const { data: emps } = await supabase.from('employees').select('id');
                if (emps && emps.length > 0) {
                    const empSkills = emps.flatMap(e =>
                        Array.from({ length: Math.floor(Math.random() * 3) + 3 }).map(() => {
                            const skill = createdSkills[Math.floor(Math.random() * createdSkills.length)];
                            return {
                                employee_id: e.id,
                                skill_id: skill.id,
                                proficiency_level: Math.floor(Math.random() * 5) + 1,
                                verified: Math.random() > 0.5
                            };
                        })
                    );
                    const uniqueEmpSkills = empSkills.filter((idx, index, self) =>
                        index === self.findIndex((t) => (t.employee_id === idx.employee_id && t.skill_id === idx.skill_id))
                    );
                    await supabase.from('employee_skills').insert(uniqueEmpSkills);
                }
            }
        }

        // 5b. Job Skills (Demand) - NEW SCHEMA
        // Note: We check if table exists by trying to select. If table missing, this block might fail if not handled, 
        // but assuming schema applied.
        const { count: jsCount, error: jsError } = await supabase.from('job_skills').select('*', { count: 'exact', head: true });

        if (!jsError && (!jsCount || jsCount === 0)) {
            console.log('Seeding Job Skills (Demand)...');
            const { data: allJobs } = await supabase.from('jobs').select('id');
            const { data: allSkills } = await supabase.from('skills').select('id');

            if (allJobs && allSkills) {
                const jobSkills = allJobs.flatMap(job => {
                    // Assign 2-5 random skills per job
                    const count = Math.floor(Math.random() * 4) + 2;
                    const shuffled = [...allSkills].sort(() => 0.5 - Math.random());
                    const selected = shuffled.slice(0, count);

                    return selected.map(skill => ({
                        job_id: job.id,
                        skill_id: skill.id,
                        required_level: Math.floor(Math.random() * 3) + 2, // Levels 2-5
                        importance: Math.random() > 0.3 ? 'Must Have' : 'Nice to Have'
                    }));
                });
                await supabase.from('job_skills').insert(jobSkills);
            }
        }

        // 6. Training
        const { count: trainCount } = await supabase.from('trainings').select('*', { count: 'exact', head: true });
        if (!trainCount || trainCount === 0) {
            console.log('Seeding Trainings...');
            const courses = [
                { title: 'Advanced React Patterns', provider: 'Frontend Masters', duration_hours: 12, type: 'Online' },
                { title: 'Leadership 101', provider: 'Internal', duration_hours: 8, type: 'Workshop' },
                { title: 'Cybersecurity Awareness', provider: 'KnowBe4', duration_hours: 2, type: 'Seminar' },
                { title: 'Agile Methodologies', provider: 'Scrimba', duration_hours: 20, type: 'Online' }
            ];
            const { data: createdCourses } = await supabase.from('trainings').insert(courses).select();

            if (createdCourses) {
                const { data: emps } = await supabase.from('employees').select('id');
                if (emps && emps.length > 0) {
                    const completions = emps.flatMap(e =>
                        Array.from({ length: Math.floor(Math.random() * 3) }).map(() => {
                            const course = createdCourses[Math.floor(Math.random() * createdCourses.length)];
                            return {
                                employee_id: e.id,
                                training_id: course.id,
                                completion_date: new Date(2023, Math.floor(Math.random() * 12), 1).toISOString(),
                                status: 'Completed',
                                score: Math.floor(Math.random() * 30) + 70
                            };
                        })
                    );
                    await supabase.from('training_completions').insert(completions);
                }
            }
        }

        // 7. Goals
        const { count: goalCount } = await supabase.from('goals').select('*', { count: 'exact', head: true });
        if (!goalCount || goalCount === 0) {
            console.log('Seeding Goals...');
            const { data: emps } = await supabase.from('employees').select('id');
            if (emps && emps.length > 0) {
                const goals = emps.flatMap(e =>
                    Array.from({ length: Math.floor(Math.random() * 4) + 1 }).map((_, i) => ({
                        employee_id: e.id,
                        title: `Q${i + 1} Performance Goal`,
                        description: 'Improve metrics by 15%',
                        status: ['In Progress', 'Completed', 'Not Started'][Math.floor(Math.random() * 3)],
                        progress: Math.floor(Math.random() * 100),
                        due_date: new Date(2024, (i + 1) * 3, 1).toISOString()
                    }))
                );
                await supabase.from('goals').insert(goals);
            }
        }

        // 8. Assets
        const { count: assetCount } = await supabase.from('assets').select('*', { count: 'exact', head: true });
        if (!assetCount || assetCount === 0) {
            console.log('Seeding Assets...');
            const { data: emps } = await supabase.from('employees').select('id');
            if (emps && emps.length > 0) {
                const assets = emps.flatMap(e => {
                    if (Math.random() > 0.8) return [];
                    return [{
                        assigned_to: e.id,
                        name: 'MacBook Pro 16"',
                        type: 'Laptop',
                        serial_number: `MBP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                        purchase_date: new Date(2022, 1, 1).toISOString(),
                        condition: 'Good'
                    }];
                });
                await supabase.from('assets').insert(assets);
            }
        }

        // 9. Onboarding
        const { count: taskCount } = await supabase.from('onboarding_tasks').select('*', { count: 'exact', head: true });
        if (!taskCount || taskCount === 0) {
            console.log('Seeding Onboarding...');
            const { data: emps } = await supabase.from('employees').select('id');
            if (emps && emps.length > 0) {
                const tasks = emps.slice(0, 5).flatMap(e => [
                    { employee_id: e.id, title: 'IT Setup', status: 'Completed', completed_at: new Date().toISOString() },
                    { employee_id: e.id, title: 'HR Orientation', status: 'In Progress', due_date: new Date().toISOString() }
                ]);
                await supabase.from('onboarding_tasks').insert(tasks);
            }
        }
        // 10. Trigger New Analytics Seeders
        await this.ensureSkillsData();
        await this.ensureTrainingData();
        await this.ensureGoalsData();
        await this.ensureAssetsData();
        await this.ensureVacationData(); // For Life Balance
    },

    // Seed Method
    async seedData() {
        // Ensure Enterprise Data exists first
        await this.seedEnterpriseData();

        // Check if main data exists
        const { count } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true });

        // Get Real Employee Data for Calculations
        const { count: empCount } = await supabase.from('employees').select('*', { count: 'exact', head: true });

        let calculatedMetrics = {
            totalEmployees: empCount || 1248,
            deptDist: [] as any[],
            genderDist: [] as any[],
            salaryDist: [] as any[]
        };

        if (empCount && empCount > 0) {
            // Fetch raw data for aggregation
            const { data: emps } = await supabase.from('employees').select('id, gender, department_id, salary, performance_rating, departments(name)');

            if (emps) {
                // Department Distribution
                const deptMap = new Map();
                emps.forEach((e: any) => {
                    const dName = e.departments?.name || 'Unknown';
                    deptMap.set(dName, (deptMap.get(dName) || 0) + 1);
                });
                calculatedMetrics.deptDist = Array.from(deptMap.entries()).map(([label, value]) => ({ label, value }));

                // Gender Distribution
                const genderMap = new Map();
                emps.forEach((e: any) => {
                    const g = e.gender || 'Not Specified';
                    genderMap.set(g, (genderMap.get(g) || 0) + 1);
                });
                calculatedMetrics.genderDist = Array.from(genderMap.entries()).map(([label, value]) => ({ label, value }));

                // Salary Distribution
                const salMap = { '0-50k': 0, '50k-100k': 0, '100k-150k': 0, '150k+': 0 };
                emps.forEach((e: any) => {
                    const s = e.salary || 0;
                    if (s < 50000) salMap['0-50k']++;
                    else if (s < 100000) salMap['50k-100k']++;
                    else if (s < 150000) salMap['100k-150k']++;
                    else salMap['150k+']++;
                });
                calculatedMetrics.salaryDist = Object.entries(salMap).map(([label, value]) => ({ label, value }));
            }
        }

        if (!count || count === 0) {
            console.log('Seeding Main Analytics Data with DYNAMIC values...');
            // 1. Seed KPIs
            // Transform AnalyticsKPI (with trend_value) to DB Schema (with trend)
            const mapKPI = (k: AnalyticsKPI) => ({
                category: k.category,
                label: k.label,
                value: k.value,
                trend: k.trend_value, // Map interface property to DB column
                trend_direction: k.trend_direction,
                icon: k.trend_label   // WORKAROUND: Schema lacks 'trend_label', using 'icon' column
            });

            const kpis: AnalyticsKPI[] = [
                // HRIS
                { category: 'hris', label: 'Headcount', value: calculatedMetrics.totalEmployees.toLocaleString(), trend_value: '12%', trend_direction: 'up', trend_label: 'vs last quarter' },
                { category: 'hris', label: 'Attrition Risk', value: 'Medium', trend_value: '2.4%', trend_direction: 'down', trend_label: 'stable' },
                { category: 'hris', label: 'Policy Violations', value: '3', trend_value: '50%', trend_direction: 'down', trend_label: 'vs last month' },
                { category: 'hris', label: 'Avg Performance', value: '3.9/5', trend_label: 'Based on recent reviews' },
                { category: 'hris', label: 'Open Positions', value: '24', trend_label: 'Across 8 departments' },

                // Recruitments
                { category: 'recruitments', label: 'Total Applicants', value: '850', trend_value: '18%', trend_direction: 'up', trend_label: 'vs last month' },
                { category: 'recruitments', label: 'Open Roles', value: '24', trend_label: '6 urgent priority' },
                { category: 'recruitments', label: 'Avg Time to Hire', value: '26 days', trend_value: '15%', trend_direction: 'down', trend_label: 'vs last qtr' },
                { category: 'recruitments', label: 'Offer Acceptance', value: '82%', trend_label: 'Industry avg: 70%' },

                // Performance
                { category: 'performance', label: 'Avg Review Score', value: '4.1', trend_value: '0.3', trend_direction: 'up', trend_label: 'vs last cycle' },
                { category: 'performance', label: 'Reviews Completed', value: '85%', trend_label: '423/498 Employees' },
                { category: 'performance', label: 'Promotion Ready', value: '32', trend_label: '12 Pending Approval' },
                { category: 'performance', label: 'PIP Cases', value: '5', trend_label: 'Requires Action' },

                // Payroll
                { category: 'payroll', label: 'Total Payroll', value: '$12.4M', trend_value: '4%', trend_direction: 'up', trend_label: 'Monthly' },
                { category: 'payroll', label: 'Avg Salary', value: '$98k', trend_value: '2%', trend_direction: 'up', trend_label: 'Annualized' },
                { category: 'payroll', label: 'Overtime Cost', value: '$45k', trend_value: '12%', trend_direction: 'down', trend_label: 'vs last month' },
                { category: 'payroll', label: 'Benefits Ratio', value: '22%', trend_label: 'of Total Comp' },

                // Sentiments
                { category: 'sentiments', label: 'Overall eNPS', value: '+42', trend_value: '5', trend_direction: 'up', trend_label: 'vs last survey' },
                { category: 'sentiments', label: 'Response Rate', value: '78%', trend_label: '350 responses' },
                { category: 'sentiments', label: 'Engagement', value: '4.2/5', trend_value: '0.1', trend_direction: 'up', trend_label: 'vs last quarter' },
                { category: 'sentiments', label: 'Top Driver', value: 'Culture', trend_label: 'Culture & Values' },

                // Requests
                { category: 'requests', label: 'Total Requests', value: '145', trend_value: '12%', trend_direction: 'up', trend_label: 'this week' },
                { category: 'requests', label: 'Avg Resolution', value: '4.2h', trend_value: '1.5h', trend_direction: 'down', trend_label: 'vs target' },
                { category: 'requests', label: 'SLA Breach', value: '3.4%', trend_label: 'Below 5% target', trend_direction: 'down', trend_value: '0.5%' },
                { category: 'requests', label: 'Satisfaction', value: '4.8/5', trend_label: 'Based on 120 ratings' },
            ];

            const { error: kpiError } = await supabase.from('analytics_kpis').insert(kpis.map(mapKPI));
            if (kpiError) console.error('Error seeding KPIs:', kpiError);

            // 2. Seed Trends
            const trends: AnalyticsTrend[] = [
                // Headcount
                ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                    category: 'hris', chart_id: 'headcount_trend', period: m, value: (calculatedMetrics.totalEmployees - 100) + (i * 20)
                })),
                // Attrition
                ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                    category: 'hris', chart_id: 'attrition_trend', period: m, value: 2.5 + (Math.sin(i) * 0.5)
                })),
                // Time to Hire
                ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                    category: 'recruitments', chart_id: 'time_to_hire_trend', period: m, value: 45 - (i * 2)
                })),
                // Payroll Trend
                ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                    category: 'payroll', chart_id: 'payroll_trend', period: m, value: 12000000 + (i * 50000), extra_value: 50000 + (i * 2000)
                })),
                // Sentiment Trend
                ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                    category: 'sentiments', chart_id: 'sentiment_trend', period: m, value: 3.5 + (i * 0.1)
                })),
                // Request Volume
                ...['W1', 'W2', 'W3', 'W4'].map((w, i) => ({
                    category: 'requests', chart_id: 'request_volume', period: w, value: 40 + (i * 5), extra_value: 35 + (i * 5)
                })),
            ];
            const { error: trendError } = await supabase.from('analytics_trends').insert(trends);
            if (trendError) console.error('Error seeding Trends:', trendError);

            // 3. Seed Categories
            const deptDistData = calculatedMetrics.deptDist.length > 0
                ? calculatedMetrics.deptDist.map((d, i) => ({ category: 'hris', chart_id: 'dept_distribution', label: d.label, value: d.value, color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] }))
                : [
                    { category: 'hris', chart_id: 'dept_distribution', label: 'Engineering', value: 45, color: '#3b82f6' },
                    { category: 'hris', chart_id: 'dept_distribution', label: 'Sales', value: 30, color: '#10b981' },
                    { category: 'hris', chart_id: 'dept_distribution', label: 'Marketing', value: 15, color: '#f59e0b' },
                    { category: 'hris', chart_id: 'dept_distribution', label: 'HR', value: 10, color: '#ef4444' }
                ];

            const salaryDistData = calculatedMetrics.salaryDist.length > 0
                ? calculatedMetrics.salaryDist.map(d => ({ category: 'payroll', chart_id: 'salary_distribution', label: d.label, value: d.value }))
                : [
                    { category: 'payroll', chart_id: 'salary_distribution', label: '0-50k', value: 15 },
                    { category: 'payroll', chart_id: 'salary_distribution', label: '50k-100k', value: 45 },
                    { category: 'payroll', chart_id: 'salary_distribution', label: '100k-150k', value: 25 },
                    { category: 'payroll', chart_id: 'salary_distribution', label: '150k+', value: 15 },
                ];

            const categories: AnalyticsCategory[] = [
                ...deptDistData,
                ...salaryDistData,
                // Performance Distribution
                { category: 'hris', chart_id: 'performance_distribution', label: '1', value: 5 },
                { category: 'hris', chart_id: 'performance_distribution', label: '2', value: 15 },
                { category: 'hris', chart_id: 'performance_distribution', label: '3', value: 60 },
                { category: 'hris', chart_id: 'performance_distribution', label: '4', value: 120 },
                { category: 'hris', chart_id: 'performance_distribution', label: '5', value: 80 },
                // Source of Hire
                { category: 'recruitments', chart_id: 'source_of_hire', label: 'LinkedIn', value: 45, color: '#0077b5' },
                { category: 'recruitments', chart_id: 'source_of_hire', label: 'Referrals', value: 30, color: '#10b981' },
                { category: 'recruitments', chart_id: 'source_of_hire', label: 'Website', value: 15, color: '#3b82f6' },
                { category: 'recruitments', chart_id: 'source_of_hire', label: 'Agencies', value: 10, color: '#f59e0b' },
                // Payroll by Dept
                ...(calculatedMetrics.deptDist.length > 0 ? calculatedMetrics.deptDist.slice(0, 5).map((d, i) => ({ category: 'payroll', chart_id: 'payroll_by_dept', label: d.label, value: d.value * 2, color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5] })) : []),
                // Request Category
                { category: 'requests', chart_id: 'request_category', label: 'Hardware', value: 35, color: '#3b82f6' },
                { category: 'requests', chart_id: 'request_category', label: 'Access', value: 25, color: '#10b981' },
                { category: 'requests', chart_id: 'request_category', label: 'Software', value: 20, color: '#f59e0b' },
                { category: 'requests', chart_id: 'request_category', label: 'Benefits', value: 15, color: '#ef4444' },
                { category: 'requests', chart_id: 'request_category', label: 'Other', value: 5, color: '#8b5cf6' },
                // Sentiment Breakdown
                { category: 'sentiments', chart_id: 'sentiment_breakdown', label: 'Management', value: 4.2 },
                { category: 'sentiments', chart_id: 'sentiment_breakdown', label: 'Work-Life Balance', value: 3.8 },
                { category: 'sentiments', chart_id: 'sentiment_breakdown', label: 'Growth', value: 4.0 },
                { category: 'sentiments', chart_id: 'sentiment_breakdown', label: 'Compensation', value: 3.5 },
                { category: 'sentiments', chart_id: 'sentiment_breakdown', label: 'Culture', value: 4.5 },
                // Rejection Reasons
                { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Compensation', value: 45, color: '#ef4444' },
                { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Better Offer', value: 30, color: '#f59e0b' },
                { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Role Fit', value: 15, color: '#3b82f6' },
                { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Relocation', value: 10, color: '#10b981' },
            ];
            const { error: catError } = await supabase.from('analytics_categories').insert(categories);
            if (catError) console.error('Error seeding Categories:', catError);

            // 4. Seed Complex Data
            const complexData = [
                // HRIS
                ...[
                    { dept: 'Engineering', gdpr: 98, conduct: 100, infosec: 95 },
                    { dept: 'Sales', gdpr: 92, conduct: 95, infosec: 88 },
                    { dept: 'Marketing', gdpr: 100, conduct: 98, infosec: 92 },
                    { dept: 'HR', gdpr: 100, conduct: 100, infosec: 98 },
                    { dept: 'Operations', gdpr: 88, conduct: 92, infosec: 85 },
                ].map(d => ({ category: 'hris', chart_id: 'compliance_heatmap', data: d })),
                // Recruitments
                ...[
                    { stage: 'Applied', count: 850 },
                    { stage: 'Screened', count: 420 },
                    { stage: 'Interviewed', count: 180 },
                    { stage: 'Offer Sent', count: 65 },
                    { stage: 'Hired', count: 48 },
                ].map(d => ({ category: 'recruitments', chart_id: 'hiring_funnel', data: d })),
                ...[
                    { month: 'Jan', applicants: 120, hires: 8 },
                    { month: 'Feb', applicants: 145, hires: 12 },
                    { month: 'Mar', applicants: 135, hires: 10 },
                    { month: 'Apr', applicants: 160, hires: 15 },
                    { month: 'May', applicants: 180, hires: 18 },
                    { month: 'Jun', applicants: 210, hires: 22 },
                ].map(d => ({ category: 'recruitments', chart_id: 'apps_vs_hires', data: d })),
                // Performance
                ...Array.from({ length: 50 }).map((_, i) => ({
                    category: 'performance',
                    chart_id: 'talent_matrix',
                    data: {
                        id: i,
                        name: `Emp ${i}`,
                        performance: Math.floor(Math.random() * 10),
                        potential: Math.floor(Math.random() * 10)
                    }
                })),
                ...[
                    { subject: 'Technical', A: 120, B: 110 },
                    { subject: 'Leadership', A: 98, B: 130 },
                    { subject: 'Communication', A: 86, B: 130 },
                    { subject: 'Problem Solving', A: 99, B: 100 },
                    { subject: 'Teamwork', A: 85, B: 90 },
                    { subject: 'Time Mgmt', A: 65, B: 85 },
                ].map(d => ({ category: 'performance', chart_id: 'skill_gap', data: d })),
                ...[
                    { name: 'Eng', hours: 45, score: 3.8 },
                    { name: 'Sales', hours: 32, score: 4.2 },
                    { name: 'Mkt', hours: 28, score: 3.9 },
                    { name: 'HR', hours: 25, score: 4.5 },
                    { name: 'Ops', hours: 30, score: 4.0 },
                ].map(d => ({ category: 'performance', chart_id: 'training_impact', data: d })),
                ...[
                    { name: 'Eng', completed: 85, pending: 15 },
                    { name: 'Sales', completed: 92, pending: 8 },
                    { name: 'Mkt', completed: 78, pending: 22 },
                    { name: 'HR', completed: 95, pending: 5 },
                    { name: 'Ops', completed: 88, pending: 12 },
                ].map(d => ({ category: 'performance', chart_id: 'goal_completion', data: d })),
                // Payroll
                ...[
                    { month: 'Jan', budget: 460000, actual: 450000 },
                    { month: 'Feb', budget: 460000, actual: 455000 },
                    { month: 'Mar', budget: 460000, actual: 460000 },
                    { month: 'Apr', budget: 470000, actual: 465000 },
                    { month: 'May', budget: 470000, actual: 480000 },
                    { month: 'Jun', budget: 480000, actual: 495000 },
                ].map(d => ({ category: 'payroll', chart_id: 'budget_vs_actual', data: d })),
                ...[
                    { month: 'Jan', base: 380, bonus: 20, benefits: 50 },
                    { month: 'Feb', base: 385, bonus: 25, benefits: 52 },
                    { month: 'Mar', base: 390, bonus: 15, benefits: 55 },
                    { month: 'Apr', base: 395, bonus: 30, benefits: 58 },
                    { month: 'May', base: 400, bonus: 45, benefits: 60 },
                    { month: 'Jun', base: 410, bonus: 50, benefits: 62 },
                ].map(d => ({ category: 'payroll', chart_id: 'compensation_breakdown', data: d })),
                // Sentiments
                ...[
                    { name: 'Eng', positive: 65, neutral: 25, negative: 10 },
                    { name: 'Sales', positive: 70, neutral: 20, negative: 10 },
                    { name: 'Mkt', positive: 80, neutral: 15, negative: 5 },
                    { name: 'HR', positive: 75, neutral: 20, negative: 5 },
                    { name: 'Ops', positive: 60, neutral: 30, negative: 10 },
                ].map(d => ({ category: 'sentiments', chart_id: 'dept_sentiment', data: d })),
                // Request Analysis
                ...[
                    { dept: 'IT Service Desk', met: 92, breached: 8 },
                    { dept: 'HR Support', met: 88, breached: 12 },
                    { dept: 'Facilities', met: 95, breached: 5 },
                    { dept: 'Payroll', met: 98, breached: 2 },
                ].map(d => ({ category: 'requests', chart_id: 'sla_compliance', data: d })),
                // Performance vs Tenure
                ...Array.from({ length: 30 }).map((_, i) => ({
                    category: 'hris',
                    chart_id: 'performance_vs_tenure',
                    data: {
                        tenure: Math.floor(Math.random() * 10) + 1,
                        performance: (Math.random() * 2 + 3).toFixed(1),
                        name: `Emp ${i}`
                    }
                }))
            ];
            await supabase.from('analytics_complex').insert(complexData);
        } else {
            console.log('Main Analytics data already exists. Skipping main seed.');
        }

        // New Data Check (Control Plane)
        const { count: controlCount } = await supabase.from('analytics_complex')
            .select('*', { count: 'exact', head: true })
            .eq('chart_id', 'risk_heatmap');

        if (!controlCount || controlCount === 0) {
            console.log('Seeding Control Plane Data...');

            // 1. Risk Data
            // Heatmap (Complex)
            const riskHeatmap = Array.from({ length: 20 }).map((_, i) => ({
                category: 'control_risk',
                chart_id: 'risk_heatmap',
                data: {
                    id: i,
                    name: `Risk-${i + 1}`,
                    likelihood: Math.floor(Math.random() * 5) + 1,
                    impact: Math.floor(Math.random() * 5) + 1,
                    category: ['Operational', 'Financial', 'Strategic', 'Compliance'][Math.floor(Math.random() * 4)],
                    owner: ['Finance', 'IT', 'Legal', 'HR'][Math.floor(Math.random() * 4)]
                }
            }));
            await supabase.from('analytics_complex').insert(riskHeatmap);

            // Risk Trend (Trends)
            const riskTrend = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                category: 'control_risk', chart_id: 'risk_velocity', period: m, value: 50 + (Math.sin(i) * 10) + i, extra_value: 45 // Target
            }));
            await supabase.from('analytics_trends').insert(riskTrend);

            // 2. Audit Data
            // Findings Breakdown (Categories)
            const auditFindings = [
                { category: 'control_audit', chart_id: 'audit_findings', label: 'High', value: 8, color: '#ef4444' },
                { category: 'control_audit', chart_id: 'audit_findings', label: 'Medium', value: 12, color: '#f59e0b' },
                { category: 'control_audit', chart_id: 'audit_findings', label: 'Low', value: 4, color: '#3b82f6' },
            ];
            await supabase.from('analytics_categories').insert(auditFindings);

            // Audit Progress
            const auditProgress = [
                { category: 'control_audit', chart_id: 'audit_progress', label: 'Financial', value: 100, color: '#10b981' },
                { category: 'control_audit', chart_id: 'audit_progress', label: 'Operational', value: 65, color: '#3b82f6' },
                { category: 'control_audit', chart_id: 'audit_progress', label: 'IT Security', value: 30, color: '#f59e0b' },
                { category: 'control_audit', chart_id: 'audit_progress', label: 'Compliance', value: 0, color: '#9ca3af' },
            ];
            await supabase.from('analytics_categories').insert(auditProgress);

            // 3. Compliance Data
            // Framework Scores (Categories)
            const complianceScores = [
                { category: 'control_compliance', chart_id: 'compliance_frameworks', label: 'SOC2', value: 92, color: '#10b981' },
                { category: 'control_compliance', chart_id: 'compliance_frameworks', label: 'ISO 27001', value: 88, color: '#3b82f6' },
                { category: 'control_compliance', chart_id: 'compliance_frameworks', label: 'GDPR', value: 95, color: '#8b5cf6' },
                { category: 'control_compliance', chart_id: 'compliance_frameworks', label: 'HIPAA', value: 100, color: '#ef4444' }, // Maybe Critical?
            ];
            await supabase.from('analytics_categories').insert(complianceScores);

            // Compliance Trend (Trends)
            const complianceTrend = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                category: 'control_compliance', chart_id: 'compliance_trend', period: m, value: 85 + (i * 2)
            }));
            await supabase.from('analytics_trends').insert(complianceTrend);
        }

        // 5. Expansion Charts Seeding (New Charts) - Independent Block
        const { count: expCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('category', 'risk_categories');

        if (!expCount || expCount === 0) {
            const extensionCategories = [
                // Risk Categories (Pie)
                { chart_id: 'control_risk', category: 'risk_categories', label: 'Strategic', value: 30, color: '#3b82f6' },
                { chart_id: 'control_risk', category: 'risk_categories', label: 'Operational', value: 45, color: '#f59e0b' },
                { chart_id: 'control_risk', category: 'risk_categories', label: 'Financial', value: 15, color: '#10b981' },
                { chart_id: 'control_risk', category: 'risk_categories', label: 'Compliance', value: 10, color: '#ef4444' },

                // Risk Mitigation (Bar)
                { chart_id: 'control_risk', category: 'risk_mitigation', label: 'Mitigated', value: 45, color: '#10b981' },
                { chart_id: 'control_risk', category: 'risk_mitigation', label: 'In Progress', value: 30, color: '#3b82f6' },
                { chart_id: 'control_risk', category: 'risk_mitigation', label: 'Accepted', value: 15, color: '#f59e0b' },
                { chart_id: 'control_risk', category: 'risk_mitigation', label: 'Open', value: 10, color: '#ef4444' },

                // Audit by Department (Bar)
                { chart_id: 'control_audit', category: 'audit_by_dept', label: 'Finance', value: 8, color: '#3b82f6' },
                { chart_id: 'control_audit', category: 'audit_by_dept', label: 'IT', value: 12, color: '#ef4444' },
                { chart_id: 'control_audit', category: 'audit_by_dept', label: 'HR', value: 4, color: '#10b981' },
                { chart_id: 'control_audit', category: 'audit_by_dept', label: 'Ops', value: 6, color: '#f59e0b' },

                // Policy Status (Pie)
                { chart_id: 'control_compliance', category: 'policy_status', label: 'Reviewed', value: 45, color: '#10b981' },
                { chart_id: 'control_compliance', category: 'policy_status', label: 'Outdated', value: 5, color: '#ef4444' },
                { chart_id: 'control_compliance', category: 'policy_status', label: 'Draft', value: 12, color: '#f59e0b' },
                { chart_id: 'control_compliance', category: 'policy_status', label: 'Pending', value: 8, color: '#3b82f6' }
            ];
            await supabase.from('analytics_categories').insert(extensionCategories);

            const extensionTrends = [
                // Audit Trend
                { chart_id: 'control_audit', category: 'audit_trend', label: 'New Findings', period: 'Jan', value: 12, extra_value: 10 },
                { chart_id: 'control_audit', category: 'audit_trend', label: 'Closed Findings', period: 'Jan', value: 10, extra_value: 12 },
                { chart_id: 'control_audit', category: 'audit_trend', label: 'New Findings', period: 'Feb', value: 15, extra_value: 8 },
                { chart_id: 'control_audit', category: 'audit_trend', label: 'Closed Findings', period: 'Feb', value: 14, extra_value: 15 },
                { chart_id: 'control_audit', category: 'audit_trend', label: 'New Findings', period: 'Mar', value: 8, extra_value: 12 },
                { chart_id: 'control_audit', category: 'audit_trend', label: 'Closed Findings', period: 'Mar', value: 12, extra_value: 8 },
            ];
            await supabase.from('analytics_trends').insert(extensionTrends);

            const extensionComplex = [
                // Control Effectiveness (Grouped Bar Data)
                { category: 'control_compliance', chart_id: 'control_effectiveness', data: { name: 'Access Control', Design: 95, Operating: 92 } },
                { category: 'control_compliance', chart_id: 'control_effectiveness', data: { name: 'Data Encrypt', Design: 100, Operating: 100 } },
                { category: 'control_compliance', chart_id: 'control_effectiveness', data: { name: 'Vendor Mgmt', Design: 85, Operating: 80 } },
                { category: 'control_compliance', chart_id: 'control_effectiveness', data: { name: 'Change Mgmt', Design: 90, Operating: 88 } },
            ];
            await supabase.from('analytics_complex').insert(extensionComplex);
        }


        // 6. HRIS Enhancements Seeding (New Charts) - Independent Block
        const { count: hrisExpCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'demographics_gender');
        const { count: deptPerfCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'dept_perf');
        const { count: reviewCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'review_progress');

        if (!deptPerfCount || deptPerfCount === 0) {
            console.log('Seeding Department Performance...');
            const deptPerfData = [
                { category: 'performance', chart_id: 'dept_perf', label: 'Engineering', value: 4.2 },
                { category: 'performance', chart_id: 'dept_perf', label: 'Sales', value: 3.8 },
                { category: 'performance', chart_id: 'dept_perf', label: 'Marketing', value: 3.9 },
                { category: 'performance', chart_id: 'dept_perf', label: 'HR', value: 4.5 },
                { category: 'performance', chart_id: 'dept_perf', label: 'Product', value: 4.1 },
            ];
            await supabase.from('analytics_categories').insert(deptPerfData);
        }

        if (!reviewCount || reviewCount === 0) {
            console.log('Seeding Review Progress...');
            const reviewData = [
                { category: 'performance', chart_id: 'review_progress', label: 'Completed', value: 350, color: '#10b981' },
                { category: 'performance', chart_id: 'review_progress', label: 'In Progress', value: 120, color: '#3b82f6' },
                { category: 'performance', chart_id: 'review_progress', label: 'Not Started', value: 28, color: '#e5e7eb' },
            ];
            await supabase.from('analytics_categories').insert(reviewData);
        }

        if (!hrisExpCount || hrisExpCount === 0) {
            console.log('Seeding HRIS Enhancements Data...');
            const genderData = calculatedMetrics.genderDist.length > 0
                ? calculatedMetrics.genderDist.map((g, i) => ({ category: 'hris', chart_id: 'demographics_gender', label: g.label, value: g.value, color: ['#3b82f6', '#ec4899', '#8b5cf6', '#9ca3af'][i % 4] }))
                : [
                    { category: 'hris', chart_id: 'demographics_gender', label: 'Male', value: 55, color: '#3b82f6' },
                    { category: 'hris', chart_id: 'demographics_gender', label: 'Female', value: 42, color: '#ec4899' },
                ];

            const hrisCategories = [
                ...genderData,

                // Age Distribution (Bar)
                { category: 'hris', chart_id: 'demographics_age', label: '18-25', value: 15, color: '#3b82f6' },
                { category: 'hris', chart_id: 'demographics_age', label: '26-35', value: 45, color: '#10b981' },
                { category: 'hris', chart_id: 'demographics_age', label: '36-45', value: 25, color: '#f59e0b' },
                { category: 'hris', chart_id: 'demographics_age', label: '46-55', value: 10, color: '#ef4444' },
                { category: 'hris', chart_id: 'demographics_age', label: '55+', value: 5, color: '#8b5cf6' },

                // Tenure Distribution (Bar)
                { category: 'hris', chart_id: 'tenure_distribution', label: '< 1 Year', value: 30, color: '#3b82f6' },
                { category: 'hris', chart_id: 'tenure_distribution', label: '1-3 Years', value: 40, color: '#10b981' },
                { category: 'hris', chart_id: 'tenure_distribution', label: '3-5 Years', value: 20, color: '#f59e0b' },
                { category: 'hris', chart_id: 'tenure_distribution', label: '5+ Years', value: 10, color: '#ef4444' },
            ];
            await supabase.from('analytics_categories').insert(hrisCategories);

            const hrisTrends = [
                // Absenteeism Trend
                ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                    category: 'hris', chart_id: 'absenteeism_trend', period: m, value: 2.5 + (Math.sin(i) * 0.5), extra_value: 3 // Target
                }))
            ];
            await supabase.from('analytics_trends').insert(hrisTrends);
        }

        // 7. Request Analysis Seeding (New Charts) - Independent Block
        const { count: requestCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'request_category');

        if (!requestCount || requestCount === 0) {
            console.log('Seeding Request Analysis Data...');

            const requestCategories = [
                // Request Category
                { category: 'requests', chart_id: 'request_category', label: 'Hardware', value: 35, color: '#3b82f6' },
                { category: 'requests', chart_id: 'request_category', label: 'Access', value: 25, color: '#10b981' },
                { category: 'requests', chart_id: 'request_category', label: 'Software', value: 20, color: '#f59e0b' },
                { category: 'requests', chart_id: 'request_category', label: 'Benefits', value: 15, color: '#ef4444' },
                { category: 'requests', chart_id: 'request_category', label: 'Other', value: 5, color: '#8b5cf6' },

                // Resolution Time
                { category: 'requests', chart_id: 'resolution_time', label: '< 1 Hour', value: 45, color: '#10b981' },
                { category: 'requests', chart_id: 'resolution_time', label: '1-4 Hours', value: 30, color: '#3b82f6' },
                { category: 'requests', chart_id: 'resolution_time', label: '4-24 Hours', value: 15, color: '#f59e0b' },
                { category: 'requests', chart_id: 'resolution_time', label: '24+ Hours', value: 10, color: '#ef4444' },

                // Request Status
                { category: 'requests', chart_id: 'request_status', label: 'Resolved', value: 65, color: '#10b981' },
                { category: 'requests', chart_id: 'request_status', label: 'In Progress', value: 25, color: '#3b82f6' },
                { category: 'requests', chart_id: 'request_status', label: 'Open', value: 8, color: '#f59e0b' },
                { category: 'requests', chart_id: 'request_status', label: 'On Hold', value: 2, color: '#ef4444' },

                // Agent Performance
                { category: 'requests', chart_id: 'agent_perf', label: 'Sarah J.', value: 145, color: '#8b5cf6' },
                { category: 'requests', chart_id: 'agent_perf', label: 'Mike T.', value: 132, color: '#3b82f6' },
            ];
            await supabase.from('analytics_categories').insert(requestCategories);
        }

        // Seed Request Analytics (Robust Check)
        await this.ensureRequestAnalyticsData();

        // Seed Request KPIs if missing
        const { count: reqKpiCount } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true }).eq('category', 'requests');
        if (!reqKpiCount || reqKpiCount === 0) {
            console.log('Seeding Request KPIs...');
            const kpis = [
                { category: 'requests', label: 'Total Requests', value: '145', trend: '12%', trend_direction: 'up', icon: 'this week' },
                { category: 'requests', label: 'Avg Resolution', value: '4.2h', trend: '1.5h', trend_direction: 'down', icon: 'vs target' },
                { category: 'requests', label: 'SLA Breach', value: '3.4%', icon: 'Below 5% target', trend_direction: 'down', trend: '0.5%' },
                { category: 'requests', label: 'Satisfaction', value: '4.8/5', icon: 'Based on 120 ratings' },
            ];
            await supabase.from('analytics_kpis').insert(kpis);
        }

        // 7. Recruitment Enhancements Seeding (New Charts) - Independent Block
        const { count: recExpCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'time_to_fill_role');

        if (!recExpCount || recExpCount === 0) {
            console.log('Seeding Recruitment Enhancements Data...');

            // 1. Recruiter Performance (Categories: Name vs Hires)
            const recCategories = [
                { category: 'recruitments', chart_id: 'recruiter_performance', label: 'Sarah J.', value: 12, color: '#3b82f6' },
                { category: 'recruitments', chart_id: 'recruiter_performance', label: 'Mike T.', value: 8, color: '#10b981' },
                { category: 'recruitments', chart_id: 'recruiter_performance', label: 'Jessica L.', value: 15, color: '#f59e0b' },
                { category: 'recruitments', chart_id: 'recruiter_performance', label: 'David R.', value: 6, color: '#ef4444' },
            ];

            // 2. Time to Fill by Role (Categories: Role vs Days)
            const timeCategories = [
                { category: 'recruitments', chart_id: 'time_to_fill_role', label: 'Senior Dev', value: 45, color: '#3b82f6' },
                { category: 'recruitments', chart_id: 'time_to_fill_role', label: 'Product Mgr', value: 38, color: '#10b981' },
                { category: 'recruitments', chart_id: 'time_to_fill_role', label: 'Sales Rep', value: 25, color: '#f59e0b' },
                { category: 'recruitments', chart_id: 'time_to_fill_role', label: 'Designer', value: 30, color: '#ef4444' },
                { category: 'recruitments', chart_id: 'time_to_fill_role', label: 'Support', value: 15, color: '#8b5cf6' },
            ];

            await supabase.from('analytics_categories').insert([...recCategories, ...timeCategories]);

            const recTrends = [
                // 3. Cost per Hire Trend
                ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                    category: 'recruitments', chart_id: 'cost_per_hire_trend', period: m, value: 4200 + (Math.random() * 500) - (i * 50), extra_value: 4000
                })),

                // 4. Quality of Hire Score Trend
                ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                    category: 'recruitments', chart_id: 'quality_of_hire_trend', period: m, value: 85 + (i * 1.5)
                }))
            ];
            await supabase.from('analytics_trends').insert(recTrends);
        }

        // 8. Rejection Reasons (Real Data Aggregation)
        const { count: rejCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'rejection_reasons');
        if (!rejCount || rejCount === 0) {
            console.log('Seeding Rejection Reasons from Real Data...');
            const { data: apps } = await supabase.from('applicants').select('stage, rejection_reason');

            let rejectionCategories: any[] = [];
            if (apps && apps.length > 0) {
                const reasonMap = new Map();
                apps.forEach((a: any) => {
                    if (a.stage === 'Rejected' && a.rejection_reason) {
                        reasonMap.set(a.rejection_reason, (reasonMap.get(a.rejection_reason) || 0) + 1);
                    }
                });
                if (reasonMap.size > 0) {
                    rejectionCategories = Array.from(reasonMap.entries()).map(([label, value]) => ({
                        category: 'recruitments',
                        chart_id: 'rejection_reasons',
                        label,
                        value,
                        color: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 4)]
                    }));
                }
            }

            if (rejectionCategories.length === 0) {
                // Fallback if no rejected applicants yet
                rejectionCategories = [
                    { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Salary', value: 12, color: '#ef4444' },
                    { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Remote', value: 8, color: '#f59e0b' },
                    { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Role Fit', value: 5, color: '#3b82f6' },
                    { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Timing', value: 3, color: '#8b5cf6' }
                ];
            }
            await supabase.from('analytics_categories').insert(rejectionCategories);
        }


        // 8. Performance Enhancements Seeding (New Charts) - Independent Block
        const { count: perfExpCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'promotion_readiness');

        if (!perfExpCount || perfExpCount === 0) {
            console.log('Seeding Performance Enhancements Data...');

            const perfCategories = [
                // 1. Promotion Readiness (Pie)
                { category: 'performance', chart_id: 'promotion_readiness', label: 'Ready Now', value: 15, color: '#10b981' },
                { category: 'performance', chart_id: 'promotion_readiness', label: 'Ready < 1yr', value: 25, color: '#3b82f6' },
                { category: 'performance', chart_id: 'promotion_readiness', label: 'Ready > 1yr', value: 40, color: '#f59e0b' },
                { category: 'performance', chart_id: 'promotion_readiness', label: 'Not Ready', value: 20, color: '#ef4444' },

                // 2. PIP Outcomes (Bar)
                { category: 'performance', chart_id: 'pip_outcomes', label: 'Success', value: 45, color: '#10b981' },
                { category: 'performance', chart_id: 'pip_outcomes', label: 'Extended', value: 30, color: '#f59e0b' },
                { category: 'performance', chart_id: 'pip_outcomes', label: 'Termination', value: 25, color: '#ef4444' },

                // 3. Manager Rating Bias (Bar - Deviation)
                { category: 'performance', chart_id: 'manager_bias', label: 'Alex M.', value: 0.5, color: '#10b981' }, // Leniency
                { category: 'performance', chart_id: 'manager_bias', label: 'Sarah J.', value: -0.2, color: '#6b7280' }, // Neutral
                { category: 'performance', chart_id: 'manager_bias', label: 'David R.', value: -0.8, color: '#ef4444' }, // Strictness
                { category: 'performance', chart_id: 'manager_bias', label: 'Emily C.', value: 0.3, color: '#10b981' },
            ];
            await supabase.from('analytics_categories').insert(perfCategories);

            const perfTrends = [
                // 4. High Performer Retention Trend
                ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                    category: 'performance', chart_id: 'high_performer_retention', period: m, value: 98 - (i * 0.5), extra_value: 95 // Target
                }))
            ];
            await supabase.from('analytics_trends').insert(perfTrends);
        }

        // 9. Payroll Enhancements Seeding (New Charts) - Independent Block
        const { count: genderPayGapCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'gender_pay_gap');
        const { count: overtimeCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'overtime_by_dept');
        const { count: costPerHeadCount } = await supabase.from('analytics_trends').select('*', { count: 'exact', head: true }).eq('chart_id', 'cost_per_head_trend');

        if (!genderPayGapCount || genderPayGapCount === 0 || !overtimeCount || overtimeCount === 0 || !costPerHeadCount || costPerHeadCount === 0) {
            console.log('Seeding Payroll Enhancements Data...');

            if (!genderPayGapCount || genderPayGapCount === 0) {
                const payrollCategories = [
                    // 1. Gender Pay Gap (Bar)
                    { category: 'payroll', chart_id: 'gender_pay_gap', label: 'Engineering', value: 0.92, color: '#3b82f6' }, // 92 cents on dollar
                    { category: 'payroll', chart_id: 'gender_pay_gap', label: 'Sales', value: 0.88, color: '#f59e0b' },
                    { category: 'payroll', chart_id: 'gender_pay_gap', label: 'Marketing', value: 0.95, color: '#10b981' },
                    { category: 'payroll', chart_id: 'gender_pay_gap', label: 'HR', value: 0.98, color: '#ec4899' },

                    // 2. Benefits Adoption Rate (Bar)
                    { category: 'payroll', chart_id: 'benefits_adoption', label: 'Health Ins.', value: 95, color: '#10b981' },
                    { category: 'payroll', chart_id: 'benefits_adoption', label: '401k Match', value: 78, color: '#3b82f6' },
                    { category: 'payroll', chart_id: 'benefits_adoption', label: 'Gym', value: 45, color: '#f59e0b' },
                    { category: 'payroll', chart_id: 'benefits_adoption', label: 'Learning', value: 30, color: '#8b5cf6' },
                ];
                await supabase.from('analytics_categories').insert(payrollCategories);
            }

            if (!overtimeCount || overtimeCount === 0) {
                const overtimeCategories = [
                    // 3. Overtime by Department (Bar)
                    { category: 'payroll', chart_id: 'overtime_by_dept', label: 'Engineering', value: 12500, color: '#ef4444' }, // High
                    { category: 'payroll', chart_id: 'overtime_by_dept', label: 'Sales', value: 8000, color: '#f59e0b' },
                    { category: 'payroll', chart_id: 'overtime_by_dept', label: 'Support', value: 5000, color: '#3b82f6' },
                    { category: 'payroll', chart_id: 'overtime_by_dept', label: 'Marketing', value: 2000, color: '#10b981' },
                ];
                await supabase.from('analytics_categories').insert(overtimeCategories);
            }

            if (!costPerHeadCount || costPerHeadCount === 0) {
                const payrollTrends = [
                    // 4. Cost per Head Trend
                    ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                        category: 'payroll', chart_id: 'cost_per_head_trend', period: m, value: 7500 + (i * 100), extra_value: 7400 // Trend vs Target
                    }))
                ];
                await supabase.from('analytics_trends').insert(payrollTrends);
            }
        }

        // 10. Sentiments Enhancements Seeding (New Charts) - Independent Block
        const { count: enpsCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'enps_distribution');
        const { count: driversCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'key_drivers');
        const { count: responseRateCount } = await supabase.from('analytics_trends').select('*', { count: 'exact', head: true }).eq('chart_id', 'response_rate_trend');

        if (!enpsCount || enpsCount === 0 || !driversCount || driversCount === 0 || !responseRateCount || responseRateCount === 0) {
            console.log('Seeding Sentiments Enhancements Data...');

            if (!enpsCount || enpsCount === 0) {
                const sentimentCategories = [
                    // 1. eNPS Distribution (Pie)
                    { category: 'sentiments', chart_id: 'enps_distribution', label: 'Promoters', value: 55, color: '#10b981' },
                    { category: 'sentiments', chart_id: 'enps_distribution', label: 'Passives', value: 30, color: '#f59e0b' },
                    { category: 'sentiments', chart_id: 'enps_distribution', label: 'Detractors', value: 15, color: '#ef4444' },

                    // 2. Sentiment by Tenure (Bar)
                    { category: 'sentiments', chart_id: 'sentiment_by_tenure', label: '< 1 Year', value: 4.5, color: '#3b82f6' },
                    { category: 'sentiments', chart_id: 'sentiment_by_tenure', label: '1-3 Years', value: 4.1, color: '#10b981' },
                    { category: 'sentiments', chart_id: 'sentiment_by_tenure', label: '3-5 Years', value: 3.8, color: '#f59e0b' },
                    { category: 'sentiments', chart_id: 'sentiment_by_tenure', label: '5+ Years', value: 4.0, color: '#8b5cf6' },
                ];
                await supabase.from('analytics_categories').insert(sentimentCategories);
            }

            if (!driversCount || driversCount === 0) {
                const driverCategories = [
                    // 3. Key Drivers Analysis (Bar)
                    { category: 'sentiments', chart_id: 'key_drivers', label: 'Management', value: 8.5, color: '#3b82f6' }, // Impact Score
                    { category: 'sentiments', chart_id: 'key_drivers', label: 'Growth', value: 7.8, color: '#10b981' },
                    { category: 'sentiments', chart_id: 'key_drivers', label: 'Culture', value: 9.2, color: '#8b5cf6' },
                    { category: 'sentiments', chart_id: 'key_drivers', label: 'Comp', value: 6.5, color: '#ef4444' },
                ];
                await supabase.from('analytics_categories').insert(driverCategories);
            }

            if (!responseRateCount || responseRateCount === 0) {
                const sentimentTrends = [
                    // 4. Response Rate Trend
                    ...['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => ({
                        category: 'sentiments', chart_id: 'response_rate_trend', period: q, value: 65 + (i * 5), extra_value: 80 // Target
                    }))
                ];
                await supabase.from('analytics_trends').insert(sentimentTrends);
            }
        }



        // Ensure Skills & Vacation Data (Enterprise Expansion)
        await this.ensureSkillsData();
        await this.ensureVacationData();
        await this.ensureSkillsGapData();
        await this.ensureAbsenteeismData();

        // Ensure New Expansion Charts (Succession, Benefits, Participation, Reopen)
        await this.ensureExpansionCharts();
        await this.ensureControlPlaneCharts();
        await this.ensurePerformanceKPIs();
        await this.ensurePayrollKPIs();

        console.log('Seeding Complete!');
    },

    async ensurePerformanceKPIs() {
        console.log('Seeding Performance KPIs...');
        // Force refresh specific new KPI to avoid duplicates if re-run
        await supabase.from('analytics_kpis').delete().eq('label', 'Internal Prom. Rate');

        const newKpi = {
            category: 'performance',
            label: 'Internal Prom. Rate',
            value: '15%',
            trend: '2%',
            trend_direction: 'up',
            icon: 'vs last year'
        };
        await supabase.from('analytics_kpis').insert(newKpi);
    },

    async ensurePayrollKPIs() {
        console.log('Seeding Payroll KPIs...');
        // Force refresh specific new KPI to avoid duplicates if re-run
        await supabase.from('analytics_kpis').delete().eq('label', 'Avg Annual Bonus');

        const newKpi = {
            category: 'payroll',
            label: 'Avg Annual Bonus',
            value: '$8.5k',
            trend: '10%',
            trend_direction: 'up',
            icon: 'vs last year'
        };
        await supabase.from('analytics_kpis').insert(newKpi);
    },

    async ensureExpansionCharts() {
        console.log('Seeding Expansion Charts (User Request)...');

        // 1. Performance: Succession Planning (Pie)
        const { count: succCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'succession_planning');
        if (!succCount || succCount === 0) {
            await supabase.from('analytics_categories').insert([
                { category: 'performance', chart_id: 'succession_planning', label: 'Ready Now', value: 12, color: '#10b981' },
                { category: 'performance', chart_id: 'succession_planning', label: '1-2 Years', value: 25, color: '#3b82f6' },
                { category: 'performance', chart_id: 'succession_planning', label: '3-5 Years', value: 35, color: '#f59e0b' },
                { category: 'performance', chart_id: 'succession_planning', label: 'Not Ready', value: 28, color: '#ef4444' }
            ]);
        }

        // 2. Payroll: Benefit Cost Distribution (Pie)
        const { count: benCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'benefit_cost_dist');
        if (!benCount || benCount === 0) {
            await supabase.from('analytics_categories').insert([
                { category: 'payroll', chart_id: 'benefit_cost_dist', label: 'Health Insurance', value: 450000, color: '#3b82f6' },
                { category: 'payroll', chart_id: 'benefit_cost_dist', label: 'Retirement 401k', value: 250000, color: '#10b981' },
                { category: 'payroll', chart_id: 'benefit_cost_dist', label: 'Stock Options', value: 150000, color: '#8b5cf6' },
                { category: 'payroll', chart_id: 'benefit_cost_dist', label: 'Wellness', value: 50000, color: '#f59e0b' }
            ]);
        }

        // 3. Sentiments: Participation by Dept (Bar)
        const { count: partCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'participation_by_dept');
        if (!partCount || partCount === 0) {
            await supabase.from('analytics_categories').insert([
                { category: 'sentiments', chart_id: 'participation_by_dept', label: 'Engineering', value: 85, color: '#3b82f6' },
                { category: 'sentiments', chart_id: 'participation_by_dept', label: 'Sales', value: 92, color: '#10b981' },
                { category: 'sentiments', chart_id: 'participation_by_dept', label: 'Marketing', value: 78, color: '#f59e0b' },
                { category: 'sentiments', chart_id: 'participation_by_dept', label: 'HR', value: 95, color: '#8b5cf6' },
                { category: 'sentiments', chart_id: 'participation_by_dept', label: 'Finance', value: 88, color: '#ec4899' }
            ]);
        }

        // 4. Requests: Ticket Reopen Rate (Trend)
        const { count: reopenCount } = await supabase.from('analytics_trends').select('*', { count: 'exact', head: true }).eq('chart_id', 'ticket_reopen_rate').eq('period', 'Jan');
        if (!reopenCount || reopenCount === 0) {
            // Cleanup potential old data (W1, W2 etc)
            await supabase.from('analytics_trends').delete().eq('chart_id', 'ticket_reopen_rate').neq('period', 'Jan');

            const reopenData = ['Jan', 'Feb', 'Mar', 'Apr'].map((w, i) => ({
                category: 'requests',
                chart_id: 'ticket_reopen_rate',
                period: w,
                value: parseFloat((12 - (i * 1.5)).toFixed(1)), // Decreasing trend 12% -> 7.5%
                extra_value: 5 // Target
            }));
            await supabase.from('analytics_trends').insert(reopenData);
        }
        // Call new aggregation methods
        await this.ensureVacationData();
        await this.ensureSkillsData();
        await this.ensureTrainingData();
        await this.ensureGoalsData();
        await this.ensureAssetsData();
        await this.ensureControlPlaneDetails();
    },

    async ensureControlPlaneDetails() {
        console.log('Seeding Control Plane Tables...');
        const { count: auditCount } = await supabase.from('analytics_complex').select('*', { count: 'exact', head: true }).eq('chart_id', 'audit_details');

        if (!auditCount || auditCount === 0) {
            const auditLog = Array.from({ length: 15 }).map((_, i) => ({
                category: 'control_audit',
                chart_id: 'audit_details',
                data: {
                    id: `AUD-${2024001 + i}`,
                    title: ['Missing Access Logs', 'Outdated Firewall Rule', 'Vendor Risk Assessment', 'GDPR Data Mapping'][Math.floor(Math.random() * 4)],
                    severity: ['High', 'Medium', 'Low'][Math.floor(Math.random() * 3)],
                    status: ['Open', 'In Progress', 'Remediated'][Math.floor(Math.random() * 3)],
                    due_date: new Date(2024, Math.floor(Math.random() * 11), Math.floor(Math.random() * 28)).toISOString().split('T')[0],
                    owner: ['IT Security', 'Compliance', 'DevOps'][Math.floor(Math.random() * 3)]
                }
            }));
            await supabase.from('analytics_complex').insert(auditLog);
        }

        const { count: policyCount } = await supabase.from('analytics_complex').select('*', { count: 'exact', head: true }).eq('chart_id', 'policy_details');

        if (!policyCount || policyCount === 0) {
            const policyList = [
                { name: 'Information Security Policy', version: 'v2.1', status: 'Active', last_review: '2023-11-15' },
                { name: 'Data Privacy Policy', version: 'v1.4', status: 'Under Review', last_review: '2023-05-20' },
                { name: 'Acceptable Use Policy', version: 'v3.0', status: 'Active', last_review: '2024-01-10' },
                { name: 'Remote Work Policy', version: 'v1.2', status: 'Active', last_review: '2023-09-05' },
                { name: 'Access Control Policy', version: 'v2.0', status: 'Draft', last_review: '2024-02-01' }
            ].map(p => ({
                category: 'control_compliance',
                chart_id: 'policy_details',
                data: p
            }));
            await supabase.from('analytics_complex').insert(policyList);
        }
    },

    async ensureControlPlaneCharts() {
        console.log('Seeding Control Plane Charts...');

        // 0. Seed Risk KPIs (Metrics)
        // Clear existing to ensure fresh data
        const { error: riskDelError } = await supabase.from('analytics_kpis').delete().eq('category', 'risk_management');
        if (riskDelError) console.error('Error clearing Risk KPIs:', riskDelError);

        const riskKpis = [
            { category: 'risk_management', label: 'Critical Risks', value: '12', trend: '+3', trend_direction: 'down', icon: 'vs last quarter' },
            { category: 'risk_management', label: 'Mitigation Progress', value: '68%', trend: 'On track', trend_direction: 'up', icon: 'Target 75%' },
            { category: 'risk_management', label: 'Risk Velocity', value: 'Medium', trend: 'Stable', trend_direction: 'neutral', icon: 'New risks/mo' },
            { category: 'risk_management', label: 'Emerging Risks', value: '5', trend: '+2', trend_direction: 'down', icon: 'this month' },
            { category: 'risk_management', label: 'Financial Exposure', value: '$2.4M', trend: '-$150k', trend_direction: 'up', icon: 'Est. Impact' }
        ];
        const { error: riskInsError } = await supabase.from('analytics_kpis').insert(riskKpis);
        if (riskInsError) console.error('Error seeding Risk KPIs:', riskInsError);

        // 0.1 Seed Audit KPIs
        const { error: auditDelError } = await supabase.from('analytics_kpis').delete().eq('category', 'audit');
        if (auditDelError) console.error('Error clearing Audit KPIs:', auditDelError);

        const auditKpis = [
            { category: 'audit', label: 'Open Findings', value: '24', trend: '8 High Priority', trend_direction: 'down', icon: 'Active Issues' },
            { category: 'audit', label: 'Planned Audits', value: '4', trend: 'Q2 2024', trend_direction: 'neutral', icon: 'Upcoming' },
            { category: 'audit', label: 'Remediation Rate', value: '92%', trend: '+5%', trend_direction: 'up', icon: 'vs target' },
            { category: 'audit', label: 'Audit Coverage', value: '78%', trend: '+12%', trend_direction: 'up', icon: 'Yearly Goal' }
        ];
        const { error: auditInsError } = await supabase.from('analytics_kpis').insert(auditKpis);
        if (auditInsError) console.error('Error seeding Audit KPIs:', auditInsError);

        // 0.2 Seed Compliance KPIs
        const { error: compDelError } = await supabase.from('analytics_kpis').delete().eq('category', 'compliance');
        if (compDelError) console.error('Error clearing Compliance KPIs:', compDelError);

        const complianceKpis = [
            { category: 'compliance', label: 'Compliance Score', value: '94%', trend: 'SOC2 / ISO', trend_direction: 'up', icon: 'Certified' },
            { category: 'compliance', label: 'Open Gaps', value: '7', trend: 'Requires attention', trend_direction: 'down', icon: 'Critical' },
            { category: 'compliance', label: 'Policy Coverage', value: '100%', trend: 'All Staff Trained', trend_direction: 'up', icon: 'Target Met' },
            { category: 'compliance', label: 'External Audits', value: '2', trend: 'Passed', trend_direction: 'up', icon: 'This Year' }
        ];
        const { error: compInsError } = await supabase.from('analytics_kpis').insert(complianceKpis);
        if (compInsError) console.error('Error seeding Compliance KPIs:', compInsError);

        // 1. Risk Categories (Pie)
        const { count: riskCatCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'risk_categories');
        if (!riskCatCount || riskCatCount === 0) {
            const riskCatData = [
                { category: 'risk_management', chart_id: 'risk_categories', label: 'Cybersecurity', value: 45, color: '#ef4444' },
                { category: 'risk_management', chart_id: 'risk_categories', label: 'Operational', value: 30, color: '#f59e0b' },
                { category: 'risk_management', chart_id: 'risk_categories', label: 'Financial', value: 15, color: '#3b82f6' },
                { category: 'risk_management', chart_id: 'risk_categories', label: 'Legal', value: 10, color: '#10b981' }
            ];
            await supabase.from('analytics_categories').insert(riskCatData);
        }

        // 2. Risk Mitigation Status (Bar)
        const { count: mitCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'risk_mitigation');
        if (!mitCount || mitCount === 0) {
            const mitData = [
                { category: 'risk_management', chart_id: 'risk_mitigation', label: 'Fully Mitigated', value: 40, color: '#10b981' },
                { category: 'risk_management', chart_id: 'risk_mitigation', label: 'In Progress', value: 35, color: '#3b82f6' },
                { category: 'risk_management', chart_id: 'risk_mitigation', label: 'Not Started', value: 15, color: '#f59e0b' },
                { category: 'risk_management', chart_id: 'risk_mitigation', label: 'Risk Accepted', value: 10, color: '#ef4444' }
            ];
            await supabase.from('analytics_categories').insert(mitData);
        }

        // 3. Audit Progress (Bar)
        const { count: auditProgCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'audit_progress');
        if (!auditProgCount || auditProgCount === 0) {
            const progData = [
                { category: 'audit', chart_id: 'audit_progress', label: 'Q1 2024', value: 100, color: '#10b981' },
                { category: 'audit', chart_id: 'audit_progress', label: 'Q2 2024', value: 45, color: '#3b82f6' },
                { category: 'audit', chart_id: 'audit_progress', label: 'Q3 2024', value: 0, color: '#e5e7eb' },
                { category: 'audit', chart_id: 'audit_progress', label: 'Q4 2024', value: 0, color: '#e5e7eb' }
            ];
            await supabase.from('analytics_categories').insert(progData);
        }

        // 4. Policy Status (Pie)
        const { count: polCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'policy_status');
        if (!polCount || polCount === 0) {
            const polData = [
                { category: 'control_compliance', chart_id: 'policy_status', label: 'Up to Date', value: 85, color: '#10b981' },
                { category: 'control_compliance', chart_id: 'policy_status', label: 'Review Pending', value: 10, color: '#f59e0b' },
                { category: 'control_compliance', chart_id: 'policy_status', label: 'Overdue', value: 5, color: '#ef4444' }
            ];
            await supabase.from('analytics_categories').insert(polData);
        }

        // 5. Audit By Department (Pie) - Seeding this to be safe as well
        const { count: auditDeptCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'audit_by_department');
        if (!auditDeptCount || auditDeptCount === 0) {
            await supabase.from('analytics_categories').insert([
                { category: 'audit', chart_id: 'audit_by_department', label: 'Finance', value: 8, color: '#ef4444' },
                { category: 'audit', chart_id: 'audit_by_department', label: 'IT', value: 12, color: '#3b82f6' },
                { category: 'audit', chart_id: 'audit_by_department', label: 'HR', value: 4, color: '#10b981' }
            ]);
        }
    },

    async ensureRequestAnalyticsData() {
        console.log('Seeding Request Analysis Data (Robust Check)...');

        // 1. Resolution Time Distribution (Categories)
        const { count: resTimeCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'resolution_time');
        if (!resTimeCount || resTimeCount === 0) {
            await supabase.from('analytics_categories').insert([
                { category: 'requests', chart_id: 'resolution_time', label: '< 1h', value: 35, color: '#10b981' },
                { category: 'requests', chart_id: 'resolution_time', label: '1-4h', value: 45, color: '#3b82f6' },
                { category: 'requests', chart_id: 'resolution_time', label: '4-24h', value: 15, color: '#f59e0b' },
                { category: 'requests', chart_id: 'resolution_time', label: '> 24h', value: 5, color: '#ef4444' }
            ]);
        }

        // 2. Request Status Overview (Categories)
        const { count: reqStatusCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'request_status');
        if (!reqStatusCount || reqStatusCount === 0) {
            await supabase.from('analytics_categories').insert([
                { category: 'requests', chart_id: 'request_status', label: 'Resolved', value: 65, color: '#10b981' },
                { category: 'requests', chart_id: 'request_status', label: 'In Progress', value: 25, color: '#3b82f6' },
                { category: 'requests', chart_id: 'request_status', label: 'New', value: 8, color: '#f59e0b' },
                { category: 'requests', chart_id: 'request_status', label: 'Escalated', value: 2, color: '#ef4444' }
            ]);
        }

        // 3. Agent Performance (Categories)
        const { count: agentPerfCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'agent_perf');
        if (!agentPerfCount || agentPerfCount === 0) {
            await supabase.from('analytics_categories').insert([
                { category: 'requests', chart_id: 'agent_perf', label: 'Sarah J.', value: 145, color: '#8b5cf6' },
                { category: 'requests', chart_id: 'agent_perf', label: 'Mike T.', value: 132, color: '#3b82f6' },
                { category: 'requests', chart_id: 'agent_perf', label: 'Jessica R.', value: 128, color: '#10b981' },
                { category: 'requests', chart_id: 'agent_perf', label: 'David L.', value: 110, color: '#f59e0b' }
            ]);
        }

        // 4. Request Volume Trend (New vs Resolved)
        const { count: volCount } = await supabase.from('analytics_trends').select('*', { count: 'exact', head: true }).eq('chart_id', 'request_volume').eq('period', 'Jan');
        if (!volCount || volCount === 0) {
            await supabase.from('analytics_trends').delete().eq('chart_id', 'request_volume').neq('period', 'Jan');
            const volData = ['Jan', 'Feb', 'Mar', 'Apr'].map((m, i) => ({
                category: 'requests', chart_id: 'request_volume', period: m, value: 40 + (i * 5), extra_value: 35 + (i * 5)
            }));
            await supabase.from('analytics_trends').insert(volData);
        }

        // 5. Ticket Backlog Trend
        const { count: backlogCount } = await supabase.from('analytics_trends').select('*', { count: 'exact', head: true }).eq('chart_id', 'backlog_trend').eq('period', 'Jan');
        if (!backlogCount || backlogCount === 0) {
            await supabase.from('analytics_trends').delete().eq('chart_id', 'backlog_trend').neq('period', 'Jan');
            const backlogData = ['Jan', 'Feb', 'Mar', 'Apr'].map((m, i) => ({
                category: 'requests', chart_id: 'backlog_trend', period: m, value: 15 + (i * 2)
            }));
            await supabase.from('analytics_trends').insert(backlogData);
        }
    },

    // NEW: Vacation Analytics (Life Balance)
    async ensureVacationData() {
        const { count } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true }).eq('category', 'life_balance');
        if (!count || count === 0) {
            console.log('Seeding Vacation KPIs...');
            const kpis = [
                { category: 'life_balance', label: 'Avg Leave Taken', value: '12 Days', trend: '2 Days', trend_direction: 'up', icon: 'vs last year' },
                { category: 'life_balance', label: 'Burnout Risk', value: '15%', trend: '5%', trend_direction: 'down', icon: 'Employees > 1yr no leave' },
                { category: 'life_balance', label: 'Pending Requests', value: '8', icon: 'Approval Needed' },
                { category: 'life_balance', label: 'Absenteeism Rate', value: '1.2%', trend: '0.2%', trend_direction: 'up', icon: 'vs industry avg' },
                { category: 'life_balance', label: 'Remote Days Avg', value: '3.2', trend: '0.5', trend_direction: 'up', icon: 'days/week' }
            ];
            await supabase.from('analytics_kpis').insert(kpis);

            // Utilization Chart
            const cats = [
                { category: 'life_balance', chart_id: 'leave_utilization', label: 'Used > 80%', value: 25, color: '#ef4444' },
                { category: 'life_balance', chart_id: 'leave_utilization', label: 'Used 50-80%', value: 45, color: '#f59e0b' },
                { category: 'life_balance', chart_id: 'leave_utilization', label: 'Used < 50%', value: 30, color: '#10b981' }
            ];
            await supabase.from('analytics_categories').insert(cats);
        }

        // 2. Work From Home Trends (Line Chart)
        const { count: wfhCount } = await supabase.from('analytics_trends').select('*', { count: 'exact', head: true }).eq('chart_id', 'wfh_trends');
        if (!wfhCount || wfhCount === 0) {
            const trendData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                category: 'life_balance',
                chart_id: 'wfh_trends',
                period: m,
                value: 2.5 + (i * 0.2), // Growing trend
                extra_value: 3 // Target
            }));
            await supabase.from('analytics_trends').insert(trendData);
        }

        // 3. Overtime Trends (Are Chart) - NEW
        const { count: otCount } = await supabase.from('analytics_trends').select('*', { count: 'exact', head: true }).eq('chart_id', 'overtime_trends');
        if (!otCount || otCount === 0) {
            const otData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                category: 'life_balance',
                chart_id: 'overtime_trends',
                period: m,
                value: 120 + (i * 10) + (Math.random() * 20), // Total Overtime Hours
                extra_value: 0
            }));
            await supabase.from('analytics_trends').insert(otData);
        }

        // 4. Work Pattern Analysis (Bar) - NEW
        const { count: workPatCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'work_patterns');
        if (!workPatCount || workPatCount === 0) {
            const patternData = [
                { category: 'life_balance', chart_id: 'work_patterns', label: 'Deep Work', value: 3.5, color: '#3b82f6' },
                { category: 'life_balance', chart_id: 'work_patterns', label: 'Meetings', value: 4.2, color: '#ef4444' }, // High meetings -> Burnout risk
                { category: 'life_balance', chart_id: 'work_patterns', label: 'Admin/Email', value: 1.5, color: '#f59e0b' },
                { category: 'life_balance', chart_id: 'work_patterns', label: 'Breaks', value: 0.5, color: '#10b981' }
            ];
            await supabase.from('analytics_categories').insert(patternData);
        }

        // 5. Wellness Engagement (Pie) - NEW
        const { count: wellCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'wellness_engagement');
        if (!wellCount || wellCount === 0) {
            const wellData = [
                { category: 'life_balance', chart_id: 'wellness_engagement', label: 'Gym Subscription', value: 45, color: '#3b82f6' },
                { category: 'life_balance', chart_id: 'wellness_engagement', label: 'Meditation App', value: 30, color: '#8b5cf6' },
                { category: 'life_balance', chart_id: 'wellness_engagement', label: 'Counseling', value: 10, color: '#10b981' },
                { category: 'life_balance', chart_id: 'wellness_engagement', label: 'None', value: 15, color: '#9ca3af' }
            ];
            await supabase.from('analytics_categories').insert(wellData);
        }

        // 6. Burnout Risk Heatmap (Complex) - NEW
        const { count: burnCount } = await supabase.from('analytics_complex').select('*', { count: 'exact', head: true }).eq('chart_id', 'burnout_risk');
        if (!burnCount || burnCount === 0) {
            const burnData = [
                { x: 'Engineering', y: 'High', value: 25 }, // 25 people high risk
                { x: 'Engineering', y: 'Medium', value: 45 },
                { x: 'Sales', y: 'High', value: 40 }, // High burnout in sales
                { x: 'Sales', y: 'Low', value: 20 },
                { x: 'Marketing', y: 'Medium', value: 30 },
                { x: 'HR', y: 'Low', value: 80 }
            ];
            await supabase.from('analytics_complex').insert({
                category: 'life_balance',
                chart_id: 'burnout_risk',
                data: { heatmap: burnData }
            });
        }
    },

    // NEW: Skills Analytics
    async ensureSkillsData() {
        const { count } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true }).eq('category', 'skills');
        if (!count || count === 0) {
            const kpis = [
                { category: 'skills', label: 'Critical Skill Gaps', value: '3', trend: 'SQL, React, Leadership', icon: 'High Priority' },
                { category: 'skills', label: 'Avg Proficiency', value: '3.8/5', trend: '0.2', trend_direction: 'up', icon: 'across org' },
                { category: 'skills', label: 'Upskilled Employees', value: '45', trend: '12', trend_direction: 'up', icon: 'this quarter' },
                { category: 'skills', label: 'Certifications Earned', value: '12', trend: '4', trend_direction: 'up', icon: 'this month' },
            ];
            await supabase.from('analytics_kpis').insert(kpis);

            // Proficiency Distribution
            const cats = [
                { category: 'skills', chart_id: 'proficiency_dist', label: 'Expert (5)', value: 15, color: '#10b981' },
                { category: 'skills', chart_id: 'proficiency_dist', label: 'Advanced (4)', value: 35, color: '#3b82f6' },
                { category: 'skills', chart_id: 'proficiency_dist', label: 'Intermediate (3)', value: 30, color: '#f59e0b' },
                { category: 'skills', chart_id: 'proficiency_dist', label: 'Novice (1-2)', value: 20, color: '#ef4444' }
            ];
            await supabase.from('analytics_categories').insert(cats);
        }

        // 2. Skill Matrix Heatmap (Real Aggregation)
        // FORCE UPDATE to ensure it reflects real DB state
        if (true) {
            await supabase.from('analytics_complex').delete().eq('chart_id', 'skill_heatmap');

            let heatmapData = [];

            try {
                // Try Fetch Real Data
                const { data: rawData, error } = await supabase
                    .from('employee_skills')
                    .select(`
                        proficiency_level,
                        skills (name, category)
                    `);

                if (error) throw error;

                if (rawData && rawData.length > 0) {
                    const map = new Map();
                    rawData.forEach((row: any) => {
                        const cat = row.skills?.category || 'General';
                        const level = row.proficiency_level || 1;

                        if (!map.has(cat)) {
                            map.set(cat, { name: cat, entry: 0, junior: 0, mid: 0, senior: 0, expert: 0 });
                        }
                        const entry = map.get(cat);
                        if (level === 1) entry.entry++;
                        else if (level === 2) entry.junior++;
                        else if (level === 3) entry.mid++;
                        else if (level === 4) entry.senior++;
                        else if (level === 5) entry.expert++;
                    });
                    heatmapData = Array.from(map.values());
                }
            } catch (err) {
                console.warn('Real data fetch failed, using fallback:', err);
            }

            // Fallback if empty or failed
            if (heatmapData.length === 0) {
                heatmapData = [
                    { name: 'Technical', entry: 5, junior: 8, mid: 12, senior: 6, expert: 3 },
                    { name: 'Design', entry: 2, junior: 4, mid: 5, senior: 3, expert: 1 },
                    { name: 'Product', entry: 3, junior: 5, mid: 7, senior: 4, expert: 2 }
                ];
            }

            await supabase.from('analytics_complex').insert({
                category: 'skills',
                chart_id: 'skill_heatmap',
                data: { matrix: heatmapData }
            });
        }



        // 3. SKILLS EXPANSION (User Request)
        // 3a. New KPI Cards: Gap Closure & Readiness
        const { count: gapCount } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true }).eq('label', 'Gap Closure Rate');
        if (!gapCount || gapCount === 0) {
            const newKpis = [
                { category: 'skills', label: 'Gap Closure Rate', value: '18%', trend: '5%', trend_direction: 'up', icon: 'monthly avg' },
                { category: 'skills', label: 'Role Readiness', value: '62%', trend: '8 roles filled internal', icon: 'candidates ready' }
            ];
            await supabase.from('analytics_kpis').insert(newKpis);
        }

        // 3b. Skill Acquisition Trend (Line Chart)
        const { count: acqCount } = await supabase.from('analytics_trends').select('*', { count: 'exact', head: true }).eq('chart_id', 'skill_acquisition');
        if (!acqCount || acqCount === 0) {
            const acqData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                category: 'skills',
                chart_id: 'skill_acquisition',
                period: m,
                value: 10 + (i * 3) + Math.floor(Math.random() * 5), // New skills verified
                extra_value: 0
            }));
            await supabase.from('analytics_trends').insert(acqData);
        }


        // 3d. Skill Proficiency Distribution
        const { count: profCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'proficiency_dist');
        if (!profCount || profCount === 0) {
            const profData = [
                { category: 'skills', chart_id: 'proficiency_dist', label: 'Entry', value: 30, color: '#3b82f6' },
                { category: 'skills', chart_id: 'proficiency_dist', label: 'Junior', value: 45, color: '#10b981' },
                { category: 'skills', chart_id: 'proficiency_dist', label: 'Mid-Level', value: 60, color: '#f59e0b' },
                { category: 'skills', chart_id: 'proficiency_dist', label: 'Senior', value: 25, color: '#ec4899' },
                { category: 'skills', chart_id: 'proficiency_dist', label: 'Expert', value: 10, color: '#8b5cf6' }
            ];
            await supabase.from('analytics_categories').insert(profData);
        }

        // 3c. Skill Supply vs Demand (Real Supply Aggregation)
        // FORCE UPDATE
        if (true) {
            await supabase.from('analytics_complex').delete().eq('chart_id', 'skill_radar');

            let radarData: any[] = [];

            try {
                // Calculate Supply from Real Data
                const { data: skills } = await supabase.from('skills').select('id, name');
                const { data: empSkills } = await supabase.from('employee_skills').select('skill_id');
                // Try fetch job_skills, if table missing this throws (but caught)
                const { data: jobSkills, error: jsError } = await supabase.from('job_skills').select('skill_id');

                if (skills && empSkills) {
                    const supplyMap = new Map();
                    empSkills.forEach((es: any) => {
                        supplyMap.set(es.skill_id, (supplyMap.get(es.skill_id) || 0) + 1);
                    });

                    const demandMap = new Map();
                    if (jobSkills && !jsError) {
                        jobSkills.forEach((js: any) => {
                            demandMap.set(js.skill_id, (demandMap.get(js.skill_id) || 0) + 1);
                        });
                    }

                    radarData = skills.slice(0, 8).map((s: any) => {
                        const supplyCount = supplyMap.get(s.id) || 0;
                        const demandCount = demandMap.get(s.id) || 0; // Will be 0 if jobSkills failed

                        return {
                            subject: s.name,
                            A: supplyCount * 10,
                            B: (demandCount > 0 ? demandCount * 5 : Math.floor(supplyCount * 8)), // Fallback Demand math if 0
                            fullMark: 150
                        };
                    });
                }
            } catch (err) {
                console.warn('Radar fetch failed, fallback', err);
            }

            if (radarData.length === 0) {
                radarData = [
                    { subject: 'React', A: 120, B: 110, fullMark: 150 },
                    { subject: 'Python', A: 98, B: 130, fullMark: 150 },
                    { subject: 'Figma', A: 86, B: 85, fullMark: 150 },
                    { subject: 'AWS', A: 65, B: 90, fullMark: 150 },
                    { subject: 'SQL', A: 100, B: 80, fullMark: 150 }
                ];
            }

            await supabase.from('analytics_complex').insert({
                category: 'skills',
                chart_id: 'skill_radar',
                data: { radar: radarData }
            });
        }
    },

    // NEW: Training Analytics
    async ensureTrainingData() {
        const { count } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true }).eq('category', 'training');
        if (!count || count === 0) {
            const kpis = [
                { category: 'training', label: 'Completion Rate', value: '88%', trend: '5%', trend_direction: 'up', icon: 'vs target 85%' },
                { category: 'training', label: 'Avg Training Hours', value: '24h', trend: 'per employee/yr', icon: 'Target 40h' },
                { category: 'training', label: 'Budget Utilized', value: '65%', trend: '$45k remaining', icon: 'Annual L&D' },
                { category: 'training', label: 'Training Satisfaction', value: '4.7/5', trend: '0.2', trend_direction: 'up', icon: 'avg rating' },
                { category: 'training', label: 'Total Investment', value: '$125k', trend: '12%', trend_direction: 'up', icon: 'YTD Spend' },
                { category: 'training', label: 'Active Learners', value: '142', trend: '85% of workforce', icon: 'Currently Enrolled' }
            ];
            await supabase.from('analytics_kpis').insert(kpis);

            // Top Courses
            const cats = [
                { category: 'training', chart_id: 'top_courses', label: 'Security 101', value: 120, color: '#3b82f6' },
                { category: 'training', chart_id: 'top_courses', label: 'Agile Basics', value: 85, color: '#10b981' },
                { category: 'training', chart_id: 'top_courses', label: 'Leadership', value: 45, color: '#f59e0b' }
            ];
            await supabase.from('analytics_categories').insert(cats);
        }

        // 2. NEW CHARTS: Provider Spend, Certifications, Hours by Dept
        const { count: provCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'provider_spend');
        if (!provCount || provCount === 0) {
            const providerData = [
                { category: 'training', chart_id: 'provider_spend', label: 'Udemy', value: 45000, color: '#ec4899' },
                { category: 'training', chart_id: 'provider_spend', label: 'Pluralsight', value: 32000, color: '#f59e0b' },
                { category: 'training', chart_id: 'provider_spend', label: 'AWS', value: 28000, color: '#3b82f6' },
                { category: 'training', chart_id: 'provider_spend', label: 'Internal', value: 15000, color: '#10b981' }
            ];
            await supabase.from('analytics_categories').insert(providerData);

            const certData = [
                { category: 'training', chart_id: 'cert_status', label: 'Certified', value: 65, color: '#10b981' },
                { category: 'training', chart_id: 'cert_status', label: 'In Progress', value: 25, color: '#3b82f6' },
                { category: 'training', chart_id: 'cert_status', label: 'Expired', value: 10, color: '#ef4444' }
            ];
            await supabase.from('analytics_categories').insert(certData);

            const hoursData = [
                { category: 'training', chart_id: 'hours_by_dept', label: 'Engineering', value: 1200, color: '#3b82f6' },
                { category: 'training', chart_id: 'hours_by_dept', label: 'Sales', value: 800, color: '#f59e0b' },
                { category: 'training', chart_id: 'hours_by_dept', label: 'Marketing', value: 600, color: '#ec4899' },
                { category: 'training', chart_id: 'hours_by_dept', label: 'HR', value: 400, color: '#10b981' }
            ];
            await supabase.from('analytics_categories').insert(hoursData);
        }

        // 3. ROI Analysis (Real Data Aggregation + Fix Blank Chart)
        // FORCE UPDATE
        if (true) {
            await supabase.from('analytics_complex').delete().eq('chart_id', 'roi_analysis');

            // Seed Real Training Data if missing
            const { count: tCount } = await supabase.from('trainings').select('*', { count: 'exact', head: true });
            if (!tCount || tCount === 0) {
                const trainings = [
                    { title: 'Leadership 101', provider: 'Internal', duration_hours: 8, cost: 1000, type: 'Workshop' },
                    { title: 'Advanced React', provider: 'Udemy', duration_hours: 20, cost: 2500, type: 'Online' },
                    { title: 'Sales Mastery', provider: 'Pluralsight', duration_hours: 12, cost: 1200, type: 'Online' },
                    { title: 'Security Basics', provider: 'Internal', duration_hours: 4, cost: 500, type: 'Seminar' },
                    { title: 'AWS Architect', provider: 'AWS', duration_hours: 40, cost: 4000, type: 'Workshop' }
                ];
                await supabase.from('trainings').insert(trainings);
            }

            // Fetch Real Data for Scatter Chart
            const { data: trainingData } = await supabase.from('trainings').select('*');
            let scatterData: any[] = [];

            if (trainingData) {
                // Mock ratings/attendees for demo purposes (in real app, query completions)
                scatterData = trainingData.map((t: any) => ({
                    name: t.title,
                    cost: t.cost || 500, // X-axis
                    rating: 3.5 + (Math.random() * 1.5), // Y-axis (3.5 to 5.0)
                    attendees: 10 + Math.floor(Math.random() * 50) // Z-axis (Bubble size)
                }));
            }

            // Fallback
            if (scatterData.length === 0) {
                scatterData = [
                    { name: 'Leadership 101', cost: 1000, rating: 4.5, attendees: 20 },
                    { name: 'Security Basics', cost: 500, rating: 3.8, attendees: 50 }
                ];
            }

            await supabase.from('analytics_complex').insert({
                category: 'training',
                chart_id: 'roi_analysis',
                data: { scatter: scatterData }
            });

            // 4. Impact on Performance (Composed Chart)
            const impactData = [
                { name: 'Eng', hours: 45, score: 4.2 },
                { name: 'Sales', hours: 30, score: 3.8 },
                { name: 'Mkt', hours: 25, score: 4.0 },
                { name: 'HR', hours: 20, score: 3.5 },
                { name: 'Ops', hours: 15, score: 3.2 }
            ];
            await supabase.from('analytics_complex').delete().eq('chart_id', 'training_impact');
            await supabase.from('analytics_complex').insert({
                category: 'training',
                chart_id: 'training_impact',
                data: impactData // Array directly
            });
        }
    },

    // NEW: Goals Analytics
    async ensureGoalsData() {
        const { count } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true }).eq('category', 'goals');
        if (!count || count === 0) {
            const kpis = [
                { category: 'goals', label: 'Goal Completion', value: '72%', trend: '8%', trend_direction: 'up', icon: 'vs last qtr' },
                { category: 'goals', label: 'On Track', value: '65%', icon: 'At Risk: 15%' },
                { category: 'goals', label: 'Avg Goals/Emp', value: '3.5', icon: 'Target 3-5' },
                { category: 'goals', label: 'Goal Alignment', value: '88%', trend: '5%', trend_direction: 'up', icon: 'linked to org' },
            ];
            await supabase.from('analytics_kpis').insert(kpis);

            // Status Dist
            const cats = [
                { category: 'goals', chart_id: 'goal_status', label: 'Completed', value: 45, color: '#10b981' },
                { category: 'goals', chart_id: 'goal_status', label: 'In Progress', value: 40, color: '#3b82f6' },
                { category: 'goals', chart_id: 'goal_status', label: 'Not Started', value: 15, color: '#ef4444' },
            ];
            await supabase.from('analytics_categories').insert(cats);
        }

        // SEPARATE CHECK FOR NEW KPIS (Stretch & Cycle Time)
        const { count: cycleCount } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true }).eq('label', 'Avg Goal Cycle Time');
        if (!cycleCount || cycleCount === 0) {
            const newKpis = [
                { category: 'goals', label: 'Stretch Goals Achieved', value: '15', trend: '3', trend_direction: 'up', icon: 'Top Performers' },
                { category: 'goals', label: 'Avg Goal Cycle Time', value: '45d', trend: '5d', trend_direction: 'down', icon: 'Target 60d' },
            ];
            await supabase.from('analytics_kpis').insert(newKpis);
        }

        // SEPARATE CHECK FOR NEW CHARTS
        // 1. Goals by Department (Pie)
        const { count: distCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'goal_distribution');
        if (!distCount || distCount === 0) {
            const distData = [
                { category: 'goals', chart_id: 'goal_distribution', label: 'Engineering', value: 35, color: '#3b82f6' },
                { category: 'goals', chart_id: 'goal_distribution', label: 'Sales', value: 25, color: '#f59e0b' },
                { category: 'goals', chart_id: 'goal_distribution', label: 'Marketing', value: 20, color: '#ec4899' },
                { category: 'goals', chart_id: 'goal_distribution', label: 'HR', value: 10, color: '#10b981' },
                { category: 'goals', chart_id: 'goal_distribution', label: 'Product', value: 10, color: '#8b5cf6' },
            ];
            await supabase.from('analytics_categories').insert(distData);
        }

        // 3. Goal Type Distribution (Bar)
        const { count: typeCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'goal_types');
        if (!typeCount || typeCount === 0) {
            const typeData = [
                { category: 'goals', chart_id: 'goal_types', label: 'Operational', value: 40, color: '#3b82f6' },
                { category: 'goals', chart_id: 'goal_types', label: 'Strategic', value: 30, color: '#8b5cf6' },
                { category: 'goals', chart_id: 'goal_types', label: 'Financial', value: 20, color: '#10b981' },
                { category: 'goals', chart_id: 'goal_types', label: 'Customer', value: 10, color: '#f59e0b' },
            ];
            await supabase.from('analytics_categories').insert(typeData);
        }

        // 4. Team Performance (Bar)
        const { count: teamCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'team_goal_perf');
        if (!teamCount || teamCount === 0) {
            const teamData = [
                { category: 'goals', chart_id: 'team_goal_perf', label: 'Engineering', value: 85, color: '#10b981' },
                { category: 'goals', chart_id: 'team_goal_perf', label: 'Sales', value: 78, color: '#3b82f6' },
                { category: 'goals', chart_id: 'team_goal_perf', label: 'Marketing', value: 72, color: '#f59e0b' },
                { category: 'goals', chart_id: 'team_goal_perf', label: 'HR', value: 90, color: '#8b5cf6' },
                { category: 'goals', chart_id: 'team_goal_perf', label: 'Product', value: 65, color: '#ef4444' },
            ];
            await supabase.from('analytics_categories').insert(teamData);
        }

        // Replacement: Active Goals Progress (Horizontal Bar)
        const { count: progCount } = await supabase.from('analytics_categories').select('*', { count: 'exact', head: true }).eq('chart_id', 'active_goals_progress');
        if (!progCount || progCount === 0) {
            const progData = [
                { category: 'goals', chart_id: 'active_goals_progress', label: 'Q1 Launch', value: 80, color: '#3b82f6' },
                { category: 'goals', chart_id: 'active_goals_progress', label: 'Hiring Sprint', value: 65, color: '#10b981' },
                { category: 'goals', chart_id: 'active_goals_progress', label: 'Cost Reduction', value: 45, color: '#f59e0b' },
                { category: 'goals', chart_id: 'active_goals_progress', label: 'Team Training', value: 90, color: '#8b5cf6' },
                { category: 'goals', chart_id: 'active_goals_progress', label: 'Audit Prep', value: 30, color: '#ef4444' },
            ];
            await supabase.from('analytics_categories').insert(progData);
        }

        // 2. Goal Completion History (Trend)
        const { count: histCount } = await supabase.from('analytics_trends').select('*', { count: 'exact', head: true }).eq('chart_id', 'goal_history');
        if (!histCount || histCount === 0) {
            const historyData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                category: 'goals',
                chart_id: 'goal_history',
                period: m,
                value: 20 + (i * 5) + Math.floor(Math.random() * 10), // Completed count
                extra_value: 0
            }));
            await supabase.from('analytics_trends').insert(historyData);
        }

        // Seed Key Results (OKRs)
        const { count: krCount } = await supabase.from('key_results').select('*', { count: 'exact', head: true });
        if (!krCount || krCount === 0) {
            console.log('Seeding Key Results for OKRs...');
            const { data: goals } = await supabase.from('goals').select('id');
            if (goals && goals.length > 0) {
                const krs = goals.flatMap(g => [
                    {
                        goal_id: g.id,
                        description: 'Reach 50% Milestone',
                        current_value: Math.floor(Math.random() * 50),
                        target_value: 100,
                        metric_unit: '%',
                        status: Math.random() > 0.5 ? 'In Progress' : 'Pending'
                    },
                    {
                        goal_id: g.id,
                        description: 'Final Review',
                        current_value: 0,
                        target_value: 1,
                        metric_unit: 'Bool',
                        status: 'Pending'
                    }
                ]);
                await supabase.from('key_results').insert(krs);
            }
        }
    },

    // NEW: Assets Analytics
    async ensureAssetsData() {
        const { count } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true }).eq('category', 'assets');
        if (!count || count === 0) {
            const kpis = [
                { category: 'assets', label: 'Total Assets', value: '450', trend: 'Valued at $1.2M', icon: 'Inventory' },
                { category: 'assets', label: 'Assigned', value: '92%', icon: '36 Unassigned' },
                { category: 'assets', label: 'Avg Age', value: '1.8 yrs', icon: 'Refresh Cycle: 3yr' },
                { category: 'assets', label: 'Maintenance Due', value: '15', icon: 'Critical: 3' },
            ];
            await supabase.from('analytics_kpis').insert(kpis);

            // Asset Types
            const cats = [
                { category: 'assets', chart_id: 'asset_types', label: 'Laptops', value: 350, color: '#3b82f6' },
                { category: 'assets', chart_id: 'asset_types', label: 'Monitors', value: 450, color: '#10b981' },
                { category: 'assets', chart_id: 'asset_types', label: 'Phones', value: 80, color: '#f59e0b' },
            ];
            await supabase.from('analytics_categories').insert(cats);
        }

        // 2. Warranty Timeline (Complex/Trend)
        const { count: warrantyCount } = await supabase.from('analytics_trends').select('*', { count: 'exact', head: true }).eq('chart_id', 'warranty_expiry');
        if (!warrantyCount || warrantyCount === 0) {
            const timelineData = ['Q1', 'Q2', 'Q3', 'Q4'].map((q, i) => ({
                category: 'assets',
                chart_id: 'warranty_expiry',
                period: q, // Quarters
                value: 10 + (i * 5), // Expiring count
                extra_value: 0
            }));
            await supabase.from('analytics_trends').insert(timelineData);
        }

        // FORCE REFRESH: Delete potentially malformed/empty existing data first
        await supabase.from('analytics_complex').delete().eq('chart_id', 'warranty_list');
        await supabase.from('analytics_categories').delete().eq('category', 'assets').in('chart_id', ['asset_age_dist', 'assets_by_vendor', 'license_utilization']);
        await supabase.from('analytics_trends').delete().eq('chart_id', 'maintenance_costs');

        // 2b. Warranty List (Complex Data for Table)
        const listData = [
            { name: 'MacBook Pro 16"', serial: 'C02XYZ123', assignee: 'Jane Doe', date: '2023-11-15', status: 'Healthy' },
            { name: 'Dell XPS 15', serial: 'DX-998877', assignee: 'John Smith', date: '2023-10-01', status: 'Warning' },
            { name: 'HP Monitor 27"', serial: 'HP-554433', assignee: 'Office 304', date: '2023-09-20', status: 'Critical' },
            { name: 'ThinkPad X1', serial: 'TP-112233', assignee: 'Sarah Lee', date: '2023-12-05', status: 'Healthy' },
            { name: 'Ipad Pro', serial: 'IP-778899', assignee: 'Design Team', date: '2023-08-15', status: 'Warning' }
        ];
        await supabase.from('analytics_complex').insert({
            category: 'assets',
            chart_id: 'warranty_list',
            data: { list: listData }
        });


        // SEPARATE CHECK FOR NEW KPIS (Pending Replacements & Software Spend)
        const { count: pendCount } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true }).eq('label', 'Pending Replacements');
        if (!pendCount || pendCount === 0) {
            const newKpis = [
                { category: 'assets', label: 'Pending Replacements', value: '24', trend: '5', trend_direction: 'down', icon: '> 3 years old' },
                { category: 'assets', label: 'Monthly Software Spend', value: '$12.5k', trend: '$1.2k', trend_direction: 'up', icon: 'SaaS licenses' },
            ];
            await supabase.from('analytics_kpis').insert(newKpis);
        }

        // SEPARATE CHECK FOR NEW CHARTS
        // 1. Asset Age Distribution (Bar)
        const ageData = [
            { category: 'assets', chart_id: 'asset_age_dist', label: '< 1 Year', value: 120, color: '#10b981' },
            { category: 'assets', chart_id: 'asset_age_dist', label: '1-2 Years', value: 200, color: '#3b82f6' },
            { category: 'assets', chart_id: 'asset_age_dist', label: '2-3 Years', value: 80, color: '#f59e0b' },
            { category: 'assets', chart_id: 'asset_age_dist', label: '3+ Years', value: 50, color: '#ef4444' }
        ];
        await supabase.from('analytics_categories').insert(ageData);


        // 2. Assets by Vendor (Pie)
        const vendorData = [
            { category: 'assets', chart_id: 'assets_by_vendor', label: 'Dell', value: 180, color: '#3b82f6' },
            { category: 'assets', chart_id: 'assets_by_vendor', label: 'Apple', value: 150, color: '#8b5cf6' },
            { category: 'assets', chart_id: 'assets_by_vendor', label: 'HP', value: 80, color: '#f59e0b' },
            { category: 'assets', chart_id: 'assets_by_vendor', label: 'Lenovo', value: 40, color: '#10b981' }
        ];
        await supabase.from('analytics_categories').insert(vendorData);


        // 3. License Utilization (Bar)
        const licData = [
            { category: 'assets', chart_id: 'license_utilization', label: 'Office 365', value: 95, color: '#3b82f6' }, // 95% used
            { category: 'assets', chart_id: 'license_utilization', label: 'Slack', value: 88, color: '#8b5cf6' },
            { category: 'assets', chart_id: 'license_utilization', label: 'Jira', value: 75, color: '#10b981' },
            { category: 'assets', chart_id: 'license_utilization', label: 'Adobe CC', value: 90, color: '#ef4444' }, // High util
            { category: 'assets', chart_id: 'license_utilization', label: 'Zoom', value: 60, color: '#f59e0b' }
        ];
        await supabase.from('analytics_categories').insert(licData);


        // 4. Maintenance Cost Trend (Trend)
        const maintData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
            category: 'assets',
            chart_id: 'maintenance_costs',
            period: m,
            value: 2000 + (i * 150) + (Math.random() * 500), // Rising costs
            extra_value: 0
        }));
        await supabase.from('analytics_trends').insert(maintData);
    },


    // --- Enterprise GRC Methods ---

    async getGRCData(table: 'risks' | 'controls' | 'internal_audits' | 'audit_findings' | 'compliance_policies') {
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async seedGRCData() {
        console.log('Seeding Enterprise GRC Data...');

        // 1. Risks
        await supabase.from('risks').upsert([
            { risk_id: 'R-001', title: 'Data Breach via 3rd Party', description: 'Vendor compromise leading to data leak.', category: 'Cybersecurity', likelihood: 4, impact: 5, status: 'Open', owner: 'CISO' },
            { risk_id: 'R-002', title: 'Regulatory Fine (GDPR)', description: 'Non-compliance with new EU directives.', category: 'Legal', likelihood: 3, impact: 5, status: 'Mitigated', owner: 'Legal' },
            { risk_id: 'R-003', title: 'Key Person Dependency', description: 'Loss of critical engineering lead.', category: 'Operational', likelihood: 2, impact: 4, status: 'Accepted', owner: 'HR' },
            { risk_id: 'R-004', title: 'Cloud Service Outage', description: 'AWS region failure affecting uptime.', category: 'Operational', likelihood: 3, impact: 5, status: 'Open', owner: 'CTO' },
            { risk_id: 'R-005', title: 'Phishing Attack', description: 'Employee credential theft.', category: 'Cybersecurity', likelihood: 5, impact: 3, status: 'Mitigated', owner: 'CISO' }
        ], { onConflict: 'risk_id' });

        // 2. Controls
        await supabase.from('controls').upsert([
            { control_code: 'AC-1', name: 'Access Control Policy', type: 'Preventive', effectiveness: 'Effective', frequency: 'Annual', last_tested: '2024-01-15' },
            { control_code: 'BC-2', name: 'Backup & Recovery', type: 'Corrective', effectiveness: 'Needs Improvement', frequency: 'Daily', last_tested: '2024-03-01' },
            { control_code: 'AT-3', name: 'Security Awareness Training', type: 'Preventive', effectiveness: 'Effective', frequency: 'Quarterly', last_tested: '2024-02-20' },
            { control_code: 'LM-4', name: 'Log Monitoring', type: 'Detective', effectiveness: 'Effective', frequency: 'Daily', last_tested: '2024-03-10' }
        ], { onConflict: 'control_code' });

        // 3. Audits
        const { data: audit } = await supabase.from('internal_audits').upsert([
            { audit_code: 'IA-24-Q1', title: 'Q1 Financial Audit', scope: 'Payroll & Expenses', status: 'Completed', auditor: 'Ernst & Young', start_date: '2024-01-10', end_date: '2024-02-15' },
            { audit_code: 'IA-24-Q2', title: 'IT Security Audit', scope: 'Access Controls', status: 'In Progress', auditor: 'Internal Team', start_date: '2024-04-01', end_date: '2024-04-30' }
        ], { onConflict: 'audit_code' });



        // 3b. Audit Findings
        // Fetch the audit to link to (specifically IA-24-Q1 for these findings)
        const { data: targetAudit, error: auditError } = await supabase.from('internal_audits').select('id').eq('audit_code', 'IA-24-Q1').single();

        if (auditError) {
            console.error('Failed to find linked audit for findings:', auditError);
        }

        if (targetAudit) {
            const { error: findingsError } = await supabase.from('audit_findings').upsert([
                { audit_id: targetAudit.id, finding_code: 'F-01', description: 'Missing expense receipts > $500', severity: 'Medium', status: 'Open', remediation_due_date: '2024-05-01' },
                { audit_id: targetAudit.id, finding_code: 'F-02', description: 'Delayed access revocation for termed employees', severity: 'High', status: 'Remediated', remediation_due_date: '2024-02-20' },
                { audit_id: targetAudit.id, finding_code: 'F-03', description: 'Unencrypted backups detected in S3', severity: 'Critical', status: 'Open', remediation_due_date: '2024-01-20' }
            ], { onConflict: 'finding_code' });

            if (findingsError) console.error('Failed to seed audit findings:', findingsError);
        }

        // 4. Compliance Policies
        await supabase.from('compliance_policies').upsert([
            { policy_code: 'POL-SEC-01', title: 'Information Security Policy', version: '2.1', status: 'Active', last_review_date: '2023-11-15', next_review_date: '2024-11-15', owner: 'CISO' },
            { policy_code: 'POL-HR-05', title: 'Remote Work Policy', version: '1.0', status: 'Active', last_review_date: '2023-06-01', next_review_date: '2024-06-01', owner: 'HR' },
            { policy_code: 'POL-DAT-02', title: 'Data Retention Policy', version: '1.2', status: 'Under Review', last_review_date: '2022-12-01', next_review_date: '2023-12-01', owner: 'Legal' }
        ], { onConflict: 'policy_code' });
    },

    // --- Documents & Employee GRC ---

    async getEmployeesData() {
        const { data, error } = await supabase.from('employees').select('*').order('full_name', { ascending: true });
        if (error) throw error;
        return data;
    },

    async getDocumentsData() {
        // Fetch documents with owner details
        const { data, error } = await supabase
            .from('documents')
            .select(`
                *,
                owner:employees!owner_id(full_name, department)
            `)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async seedDocumentsData() {
        console.log('Seeding Documents & Employee Data...');

        // 1. Employees (More varied dataset)
        const employeesList = [
            { email: 'sarah.connor@inssage.com', full_name: 'Sarah Connor', department: 'Engineering', role: 'Security Engineer', status: 'Active', risk_score: 12, last_security_training: '2025-01-10' },
            { email: 'john.doe@inssage.com', full_name: 'John Doe', department: 'HR', role: 'HR Manager', status: 'Active', risk_score: 5, last_security_training: '2024-11-20' },
            { email: 'michael.scott@inssage.com', full_name: 'Michael Scott', department: 'Sales', role: 'Regional Manager', status: 'Active', risk_score: 85, last_security_training: null }, // High Risk, No Training
            { email: 'pam.beesly@inssage.com', full_name: 'Pam Beesly', department: 'Operations', role: 'Office Administrator', status: 'On Leave', risk_score: 8, last_security_training: '2024-12-05' },
            { email: 'jim.halpert@inssage.com', full_name: 'Jim Halpert', department: 'Sales', role: 'Sales Lead', status: 'Active', risk_score: 25, last_security_training: '2025-01-05' },
            { email: 'dwight.schrute@inssage.com', full_name: 'Dwight Schrute', department: 'Sales', role: 'Assistant to RM', status: 'Active', risk_score: 65, last_security_training: '2023-05-10' }, // Expired Training, High Risk
            { email: 'angela.martin@inssage.com', full_name: 'Angela Martin', department: 'Finance', role: 'Head of Accounting', status: 'Active', risk_score: 2, last_security_training: '2024-10-01' },
            { email: 'oscar.martinez@inssage.com', full_name: 'Oscar Martinez', department: 'Finance', role: 'Accountant', status: 'Active', risk_score: 10, last_security_training: '2024-09-15' },
            { email: 'stanley.hudson@inssage.com', full_name: 'Stanley Hudson', department: 'Sales', role: 'Sales Exec', status: 'Active', risk_score: 40, last_security_training: null },
            { email: 'kelly.kapoor@inssage.com', full_name: 'Kelly Kapoor', department: 'Support', role: 'Customer Service', status: 'Active', risk_score: 55, last_security_training: '2024-08-20' },
            { email: 'toby.flenderson@inssage.com', full_name: 'Toby Flenderson', department: 'HR', role: 'HR Rep', status: 'Active', risk_score: 0, last_security_training: '2025-01-15' },
            { email: 'creed.bratton@inssage.com', full_name: 'Creed Bratton', department: 'Quality Assurance', role: 'QA Director', status: 'Active', risk_score: 95, last_security_training: null }, // Very High Risk
        ];

        const { data: employees } = await supabase.from('employees').upsert(employeesList, { onConflict: 'email' }).select();

        // 2. Documents (only if employees exist to link to)
        if (employees && employees.length > 0) {
            const sarah = employees.find(e => e.email === 'sarah.connor@inssage.com');
            const john = employees.find(e => e.email === 'john.doe@inssage.com');

            if (sarah && john) {
                await supabase.from('documents').upsert([
                    { title: 'Acceptable Use Policy', type: 'Policy', status: 'Active', risk_level: 'High', owner_id: sarah.id, version: '3.0', guardrails_count: 15 },
                    { title: 'Incident Response Plan', type: 'Procedure', status: 'Review Needed', risk_level: 'Critical', owner_id: sarah.id, version: '1.2', guardrails_count: 8 },
                    { title: 'Employee Handbook 2024', type: 'Policy', status: 'Active', risk_level: 'Low', owner_id: john.id, version: '2024.1', guardrails_count: 5 },
                    { title: 'SOC2 Type II Report', type: 'Report', status: 'Active', risk_level: 'Medium', owner_id: sarah.id, version: '2023-Final', guardrails_count: 0 },
                    { title: 'Remote Work Policy', type: 'Policy', status: 'Active', risk_level: 'Medium', owner_id: john.id, version: '1.5', guardrails_count: 3 },
                    { title: 'Data Classification Standard', type: 'Policy', status: 'Active', risk_level: 'High', owner_id: sarah.id, version: '2.0', guardrails_count: 10 }
                ], { onConflict: 'title' });
            }
        }

        // 3. Seed Compliance data now that we have employees and docs
        await this.seedComplianceData();
    },

    // --- CRUD Operations ---

    async uploadDocumentFile(file: File) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath);

        return publicUrl;
    },

    async createDocumentRecord(doc: any) {
        const { data, error } = await supabase.from('documents').insert(doc).select().single();
        if (error) throw error;
        return data;
    },

    async updateDocument(id: string, updates: any) {
        const { data, error } = await supabase.from('documents').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
    },

    async deleteDocument(id: string) {
        const { error } = await supabase.from('documents').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Compliance & Control Analytics ---

    async acknowledgeDocument(documentId: string, employeeId: string) {
        const { error } = await supabase.from('document_acknowledgments').insert({
            document_id: documentId,
            employee_id: employeeId
        });
        if (error) throw error;
    },

    async getComplianceStats(documentId: string) {
        // Simple calculation: Count Acks vs Total Active Employees
        // In real world, filter by 'applicable_department'

        const { count: totalEmployees } = await supabase.from('employees').select('*', { count: 'exact', head: true }).eq('status', 'Active');
        const { count: ackCount } = await supabase.from('document_acknowledgments').select('*', { count: 'exact', head: true }).eq('document_id', documentId);

        const total = totalEmployees || 1;
        const acknowledged = ackCount || 0;

        return {
            total,
            acknowledged,
            complianceRate: Math.round((acknowledged / total) * 100)
        };
    },

    async seedComplianceData() {
        console.log("Seeding Compliance Acks...");
        // Fetch docs and employees
        const { data: docs } = await supabase.from('documents').select('id, title');
        const { data: emps } = await supabase.from('employees').select('id');

        if (!docs || !emps) return;

        // Create some sample acks
        const acks: any[] = [];
        for (const doc of docs) {
            // Randomly acknowledge specific docs (Policies)
            if (doc.title.includes('Policy') || doc.title.includes('Handbook')) {
                for (const emp of emps) {
                    if (Math.random() > 0.3) { // 70% compliance chance
                        acks.push({
                            document_id: doc.id,
                            employee_id: emp.id
                        });
                    }
                }
            }
        }

        if (acks.length > 0) {
            await supabase.from('document_acknowledgments').upsert(acks, { onConflict: 'document_id,employee_id' });
        }
    },

    async getPeopleMetrics() {
        // 1. Fetch Employees for Risk & Training
        const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('id, risk_score, last_security_training, status');

        if (empError) throw empError;

        // 2. Fetch Aggregated Acknowledgments
        // We need: (Total Policies * Active Employees) - Actual Acks = Pending
        const { count: policyCount } = await supabase.from('documents').select('*', { count: 'exact', head: true }).eq('type', 'Policy').eq('status', 'Active');
        const { count: ackCount } = await supabase.from('document_acknowledgments').select('*', { count: 'exact', head: true });

        const activeEmployees = employees?.filter(e => e.status === 'Active') || [];
        const totalRequired = (policyCount || 0) * activeEmployees.length;
        const pending = Math.max(0, totalRequired - (ackCount || 0));

        // 3. Calculate KPIs
        const highRiskCount = employees?.filter(e => (e.risk_score || 0) > 50).length || 0;

        // Training: Count employees trained in 2024/2025 (last ~year)
        // For simplicity, just check if last_security_training is not null
        const trainedCount = employees?.filter(e => e.last_security_training).length || 0;
        const totalCount = employees?.length || 1;
        const trainingRate = Math.round((trainedCount / totalCount) * 100);

        // Security Score: 100 - Avg Risk Score
        const totalRisk = employees?.reduce((sum, e) => sum + (e.risk_score || 0), 0) || 0;
        const avgRisk = Math.round(totalRisk / totalCount);
        const securityScore = Math.max(0, 100 - avgRisk);

        return {
            highRiskEmployees: highRiskCount,
            trainingCompletion: trainingRate,
            pendingAttestations: pending,
            avgSecurityScore: securityScore
        };
    }
};
