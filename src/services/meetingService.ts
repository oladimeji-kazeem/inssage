import { supabase } from '../lib/supabase';

export interface Meeting {
    id: string;
    title: string;
    date: string;
    status: 'Scheduled' | 'Live' | 'Completed';
    attendees: string[];
    summary_url?: string;
}

// Fallback data in case the SQL hasn't been run yet or Env vars are missing
const MOCK_MEETINGS: Meeting[] = [
    { id: '1', title: 'Client Strategy Session', date: '2026-01-20T14:14:00Z', status: 'Scheduled', attendees: ['Sarah Chen (HR Manager)', 'Oladimeji (Super Admin)'] },
    { id: '2', title: 'Weekly Compliance Sync', date: '2026-01-19T13:29:00Z', status: 'Live', attendees: ['Sarah Chen', 'John Smith', 'Mike', 'Alex'] },
    { id: '3', title: 'Product Roadmap Planning', date: '2026-01-18T14:14:00Z', status: 'Completed', attendees: ['David Kim (Product Owner)', 'Maria Garcia (Data Team)'] },
    { id: '4', title: 'Weekly Governance Sync', date: '2026-01-16T14:14:00Z', status: 'Completed', attendees: ['Sarah Chen (HR Manager)', 'John Smith (Engineering)'] },
    { id: '5', title: 'Q3 Security Audit Review', date: '2026-01-05T14:14:00Z', status: 'Completed', attendees: ['Alex Wong (Security Analyst)', 'Oladimeji (Super Admin)'] },
    { id: '6', title: 'Urgent Incident Response: API Latency', date: '2025-12-19T14:14:00Z', status: 'Completed', attendees: ['John Smith (Engineering Lead)', 'David Kim (Product)'] },
    { id: '7', title: 'Monthly All-Hands', date: '2025-12-17T14:14:00Z', status: 'Completed', attendees: ['All Employees'] },
];

export const meetingService = {
    async getMeetings(): Promise<Meeting[]> {
        // Safety check: if supabase client didn't initialize (missing keys), return mock
        if (!supabase) {
            console.warn('Supabase client not initialized. Returning mock data.');
            return MOCK_MEETINGS;
        }

        try {
            const { data, error } = await supabase
                .from('meetings')
                .select('*')
                .order('date', { ascending: false });

            if (error) {
                console.warn('Supabase error fetching meetings, falling back to mock:', error);
                return MOCK_MEETINGS;
            }

            if (!data || data.length === 0) {
                return MOCK_MEETINGS; // Fallback if table is empty
            }

            return data as Meeting[];
        } catch (err) {
            console.error('Error in getMeetings:', err);
            return MOCK_MEETINGS;
        }
    },

    async createMeeting(meeting: Omit<Meeting, 'id'>) {
        if (!supabase) throw new Error('Supabase client not initialized');

        const { data, error } = await supabase
            .from('meetings')
            .insert([meeting])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteMeeting(id: string) {
        if (!supabase) return; // No-op in mock mode

        const { error } = await supabase
            .from('meetings')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
