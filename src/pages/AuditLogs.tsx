import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Filter, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Log {
    id: string;
    user_email: string;
    action: string;
    resource: string;
    risk_level: string;
    created_at: string;
}

export const AuditLogs: React.FC = () => {
    const [logs, setLogs] = useState<Log[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            const { data } = await supabase
                .from('audit_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) {
                setLogs(data);
            }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Audit & Evidence Logs</h1>
                    <p className="text-secondary">Immutable chain-of-custody for all AI and user actions.</p>
                </div>
                <Button variant="outline"> <Filter size={16} className="mr-2" /> Filter Logs</Button>
            </div>

            <Card className="p-0 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center text-secondary">
                        <Loader className="animate-spin mr-2" /> Loading audit trail...
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] font-medium">
                            <tr>
                                <th className="p-4">Log ID</th>
                                <th className="p-4">User / Actor</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Resource</th>
                                <th className="p-4">Risk Level</th>
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">Evidence</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.length === 0 ? (
                                <tr><td colSpan={7} className="text-center p-8 text-secondary">No logs found.</td></tr>
                            ) : (
                                logs.map((log, i) => (
                                    <tr key={i} className="border-b border-[var(--color-divider)] hover:bg-[var(--color-bg-hover)]">
                                        <td className="p-4 font-mono text-xs">{log.id.substring(0, 8)}...</td>
                                        <td className="p-4">{log.user_email}</td>
                                        <td className="p-4 font-medium">{log.action}</td>
                                        <td className="p-4 text-secondary">{log.resource}</td>
                                        <td className="p-4">
                                            <Badge variant={log.risk_level === 'High' ? 'error' : log.risk_level === 'Medium' ? 'warning' : 'success'}>
                                                {log.risk_level}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-secondary">{new Date(log.created_at).toLocaleString()}</td>
                                        <td className="p-4">
                                            <span className="text-xs text-primary underline cursor-pointer">View Hash</span>
                                        </td>
                                    </tr>
                                )))}
                        </tbody>
                    </table>
                )}
            </Card>
        </div>
    );
};
