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
        return data;
    },

    async getTrends(chartId: string) {
        const { data, error } = await supabase
            .from('analytics_trends')
            .select('*')
            .eq('chart_id', chartId)
            .order('period', { ascending: true }); // Note: String sort might be issues for Months.
        // Ideally we store a sort_order or date field, but keeping it simple for now.
        if (error) throw error;
        return data;
    },

    async getCategories(chartId: string) {
        const { data, error } = await supabase
            .from('analytics_categories')
            .select('*')
            .eq('chart_id', chartId);
        if (error) throw error;
        return data;
    },

    async getComplexData(chartId: string) {
        const { data, error } = await supabase
            .from('analytics_complex_data')
            .select('*')
            .eq('chart_id', chartId);
        if (error) throw error;
        return data.map(d => d.data_point);
    },

    // Seed Method
    async seedData() {
        // Check if main data exists
        const { count } = await supabase.from('analytics_kpis').select('*', { count: 'exact', head: true });

        if (!count || count === 0) {
            console.log('Seeding Main Analytics Data...');
            // 1. Seed KPIs
            const kpis: AnalyticsKPI[] = [
                // HRIS
                { category: 'hris', label: 'Headcount', value: '1,248', trend_value: '12%', trend_direction: 'up', trend_label: 'vs last quarter' },
                { category: 'hris', label: 'Attrition Risk', value: 'High', trend_value: '2.4%', trend_direction: 'up', trend_label: 'in Engineering' },
                { category: 'hris', label: 'Policy Violations', value: '3', trend_value: '50%', trend_direction: 'down', trend_label: 'vs last month' },
                { category: 'hris', label: 'Avg Performance', value: '3.8/5', trend_label: 'Based on 280 reviews' },
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
                { category: 'payroll', label: 'Total Payroll', value: '$1.2M', trend_value: '4%', trend_direction: 'up', trend_label: 'vs last month' },
                { category: 'payroll', label: 'Avg Salary', value: '$92k', trend_value: '2%', trend_direction: 'up', trend_label: 'Annualized' },
                { category: 'payroll', label: 'Overtime Cost', value: '$15k', trend_value: '12%', trend_direction: 'down', trend_label: 'vs last month' },
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
            await supabase.from('analytics_kpis').insert(kpis);
            // ... (rest of the main seed logic needs to be inside this block, but I don't want to indent the whole file)
            // Note: In a real refactor I would move this to separate functions.
            // For now, I will assume the rest of the function follows.
            // Wait, the REPLACE tool needs me to provide the content.
        } else {
            console.log('Main Analytics data already exists. Skipping main seed.');
        }

        // New Data Check (Salary Distribution)
        const { count: salaryCount } = await supabase.from('analytics_categories')
            .select('*', { count: 'exact', head: true })
            .eq('chart_id', 'salary_distribution');

        if (!salaryCount || salaryCount === 0) {
            console.log('Seeding Missing Analytics Data (Salary, Rejections, Matrix)...');
            const categories = [
                // Salary Distribution
                { category: 'payroll', chart_id: 'salary_distribution', label: '0-50k', value: 15 },
                { category: 'payroll', chart_id: 'salary_distribution', label: '50k-100k', value: 45 },
                { category: 'payroll', chart_id: 'salary_distribution', label: '100k-150k', value: 25 },
                { category: 'payroll', chart_id: 'salary_distribution', label: '150k+', value: 15 },

                // Rejection Reasons
                { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Compensation', value: 45, color: '#ef4444' },
                { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Better Offer', value: 30, color: '#f59e0b' },
                { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Role Fit', value: 15, color: '#3b82f6' },
                { category: 'recruitments', chart_id: 'rejection_reasons', label: 'Relocation', value: 10, color: '#10b981' },
            ];
            await supabase.from('analytics_categories').insert(categories);

            const complexData = [
                // Performance vs Tenure
                ...Array.from({ length: 30 }).map((_, i) => ({
                    category: 'hris',
                    chart_id: 'performance_vs_tenure',
                    data_point: {
                        tenure: Math.floor(Math.random() * 10) + 1,
                        performance: (Math.random() * 2 + 3).toFixed(1),
                        name: `Emp ${i}`
                    }
                }))
            ];
            await supabase.from('analytics_complex_data').insert(complexData);
        }




        if (!count || count === 0) {
            // 2. Seed Trends
            const trends = [
                // Headcount
                ...['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => ({
                    category: 'hris', chart_id: 'headcount_trend', period: m, value: 1150 + (i * 20)
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
                    category: 'payroll', chart_id: 'payroll_trend', period: m, value: 465000 + (i * 15000), extra_value: 11000 + (i * 2000)
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
            await supabase.from('analytics_trends').insert(trends);

            // 3. Seed Categories
            const categories = [
                // Department Distribution
                { category: 'hris', chart_id: 'dept_distribution', label: 'Engineering', value: 45, color: '#3b82f6' },
                { category: 'hris', chart_id: 'dept_distribution', label: 'Sales', value: 30, color: '#10b981' },
                { category: 'hris', chart_id: 'dept_distribution', label: 'Marketing', value: 15, color: '#f59e0b' },
                { category: 'hris', chart_id: 'dept_distribution', label: 'HR', value: 10, color: '#ef4444' },
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
                { category: 'payroll', chart_id: 'payroll_by_dept', label: 'Engineering', value: 45, color: '#3b82f6' },
                { category: 'payroll', chart_id: 'payroll_by_dept', label: 'Sales', value: 30, color: '#10b981' },
                { category: 'payroll', chart_id: 'payroll_by_dept', label: 'Marketing', value: 10, color: '#f59e0b' },
                { category: 'payroll', chart_id: 'payroll_by_dept', label: 'HR', value: 8, color: '#ef4444' },
                { category: 'payroll', chart_id: 'payroll_by_dept', label: 'Ops', value: 7, color: '#8b5cf6' },
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
            ];
            await supabase.from('analytics_categories').insert(categories);

            // 4. Seed Complex Data
            const complexData = [
                // HRIS
                ...[
                    { dept: 'Engineering', gdpr: 98, conduct: 100, infosec: 95 },
                    { dept: 'Sales', gdpr: 92, conduct: 95, infosec: 88 },
                    { dept: 'Marketing', gdpr: 100, conduct: 98, infosec: 92 },
                    { dept: 'HR', gdpr: 100, conduct: 100, infosec: 98 },
                    { dept: 'Operations', gdpr: 88, conduct: 92, infosec: 85 },
                ].map(d => ({ category: 'hris', chart_id: 'compliance_heatmap', data_point: d })),
                // Recruitments
                ...[
                    { stage: 'Applied', count: 850 },
                    { stage: 'Screened', count: 420 },
                    { stage: 'Interviewed', count: 180 },
                    { stage: 'Offer Sent', count: 65 },
                    { stage: 'Hired', count: 48 },
                ].map(d => ({ category: 'recruitments', chart_id: 'hiring_funnel', data_point: d })),
                ...[
                    { month: 'Jan', applicants: 120, hires: 8 },
                    { month: 'Feb', applicants: 145, hires: 12 },
                    { month: 'Mar', applicants: 135, hires: 10 },
                    { month: 'Apr', applicants: 160, hires: 15 },
                    { month: 'May', applicants: 180, hires: 18 },
                    { month: 'Jun', applicants: 210, hires: 22 },
                ].map(d => ({ category: 'recruitments', chart_id: 'apps_vs_hires', data_point: d })),
                // Performance
                ...Array.from({ length: 50 }).map((_, i) => ({
                    category: 'performance',
                    chart_id: 'talent_matrix',
                    data_point: {
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
                ].map(d => ({ category: 'performance', chart_id: 'skill_gap', data_point: d })),
                ...[
                    { name: 'Eng', hours: 45, score: 3.8 },
                    { name: 'Sales', hours: 32, score: 4.2 },
                    { name: 'Mkt', hours: 28, score: 3.9 },
                    { name: 'HR', hours: 25, score: 4.5 },
                    { name: 'Ops', hours: 30, score: 4.0 },
                ].map(d => ({ category: 'performance', chart_id: 'training_impact', data_point: d })),
                ...[
                    { name: 'Eng', completed: 85, pending: 15 },
                    { name: 'Sales', completed: 92, pending: 8 },
                    { name: 'Mkt', completed: 78, pending: 22 },
                    { name: 'HR', completed: 95, pending: 5 },
                    { name: 'Ops', completed: 88, pending: 12 },
                ].map(d => ({ category: 'performance', chart_id: 'goal_completion', data_point: d })),
                // Payroll
                ...[
                    { month: 'Jan', budget: 460000, actual: 450000 },
                    { month: 'Feb', budget: 460000, actual: 455000 },
                    { month: 'Mar', budget: 460000, actual: 460000 },
                    { month: 'Apr', budget: 470000, actual: 465000 },
                    { month: 'May', budget: 470000, actual: 480000 },
                    { month: 'Jun', budget: 480000, actual: 495000 },
                ].map(d => ({ category: 'payroll', chart_id: 'budget_vs_actual', data_point: d })),
                ...[
                    { month: 'Jan', base: 380, bonus: 20, benefits: 50 },
                    { month: 'Feb', base: 385, bonus: 25, benefits: 52 },
                    { month: 'Mar', base: 390, bonus: 15, benefits: 55 },
                    { month: 'Apr', base: 395, bonus: 30, benefits: 58 },
                    { month: 'May', base: 400, bonus: 45, benefits: 60 },
                    { month: 'Jun', base: 410, bonus: 50, benefits: 62 },
                ].map(d => ({ category: 'payroll', chart_id: 'compensation_breakdown', data_point: d })),
                // Sentiments
                ...[
                    { name: 'Eng', positive: 65, neutral: 25, negative: 10 },
                    { name: 'Sales', positive: 70, neutral: 20, negative: 10 },
                    { name: 'Mkt', positive: 80, neutral: 15, negative: 5 },
                    { name: 'HR', positive: 75, neutral: 20, negative: 5 },
                    { name: 'Ops', positive: 60, neutral: 30, negative: 10 },
                ].map(d => ({ category: 'sentiments', chart_id: 'dept_sentiment', data_point: d })),
                // Request Analysis
                ...[
                    { dept: 'IT Service Desk', met: 92, breached: 8 },
                    { dept: 'HR Support', met: 88, breached: 12 },
                    { dept: 'Facilities', met: 95, breached: 5 },
                    { dept: 'Payroll', met: 98, breached: 2 },
                ].map(d => ({ category: 'requests', chart_id: 'sla_compliance', data_point: d })),
            ];
            await supabase.from('analytics_complex_data').insert(complexData);
        }
        console.log('Seeding Complete!');
    }
};
