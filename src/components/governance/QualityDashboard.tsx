import React, { useState, useEffect } from 'react';
import { governanceService } from '../../services/governanceService';
import { CheckCircle, AlertTriangle, XCircle, Activity, FileText, User, ArrowDown } from 'lucide-react';
import '../../pages/Governance.css';

export const QualityDashboard: React.FC = () => {
    // Mock initial state
    const [qualityKpis] = useState([
        { label: 'Overall Score', value: '94%', trend: '+2%', status: 'good', icon: Activity, color: 'icon-blue', border: 'kpi-blue' },
        { label: 'Failed Checks', value: '12', trend: '-5', status: 'good', icon: XCircle, color: 'icon-purple', border: 'kpi-purple' },
        { label: 'Critical Assets', value: '100%', trend: 'Stable', status: 'good', icon: CheckCircle, color: 'icon-green', border: 'kpi-green' },
        { label: 'Freshness', value: '2h Avg', trend: '-10m', status: 'neutral', icon: ArrowDown, color: 'icon-orange', border: 'kpi-orange' },
    ]);

    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await governanceService.getQualityLogs();
                if (data && data.length > 0) setLogs(data);
                else {
                    setLogs([
                        { id: 1, rule: { rule_name: 'Email Not Null', asset: { name: 'employees' } }, status: 'Pass', value: '100%', checked_at: new Date().toISOString() },
                        { id: 2, rule: { rule_name: 'Unique IDs', asset: { name: 'transactions' } }, status: 'Fail', value: '3 Dupes', checked_at: new Date(Date.now() - 3600000).toISOString() },
                        { id: 3, rule: { rule_name: 'Phone Format', asset: { name: 'employees' } }, status: 'Warning', value: '98%', checked_at: new Date(Date.now() - 7200000).toISOString() },
                        { id: 4, rule: { rule_name: 'Daily Load', asset: { name: 'sales_mart' } }, status: 'Pass', value: 'Success', checked_at: new Date(Date.now() - 86400000).toISOString() },
                    ]);
                }
            } catch (e) { console.error(e); }
        };
        load();
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="analytics-grid-4">
                {qualityKpis.map((kpi, i) => (
                    <div key={i} className={`kpi-card ${kpi.border}`}>
                        <div>
                            <div className="kpi-label">{kpi.label}</div>
                            <div className="kpi-value">{kpi.value}</div>
                            <div className={`kpi-trend ${kpi.status === 'good' ? 'trend-up' : 'trend-neutral'}`}>
                                {kpi.trend} vs last week
                            </div>
                        </div>
                        <div className={`kpi-icon ${kpi.color}`}>
                            <kpi.icon size={18} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="premium-table-container">
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: 'white' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={18} className="text-indigo-500" /> Recent Quality Checks
                    </h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th style={{ width: '80px' }}>Status</th>
                                <th>Rule Name</th>
                                <th>Asset</th>
                                <th>Value</th>
                                <th>Checked At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log: any, i) => (
                                <tr key={i}>
                                    <td>
                                        {log.status === 'Pass' && <CheckCircle size={18} color="#22c55e" />}
                                        {log.status === 'Fail' && <XCircle size={18} color="#ef4444" />}
                                        {log.status === 'Warning' && <AlertTriangle size={18} color="#f97316" />}
                                    </td>
                                    <td style={{ fontWeight: '600' }}>{log.rule?.rule_name}</td>
                                    <td style={{ color: '#6b7280' }}>{log.rule?.asset?.name}</td>
                                    <td style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.value}</td>
                                    <td style={{ color: '#9ca3af', fontSize: '12px' }}>{new Date(log.checked_at).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const AuditLog: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await governanceService.getAuditLogs();
                if (data && data.length > 0) setLogs(data);
                else {
                    setLogs([
                        { id: 1, user: { full_name: 'John Doe', email: 'john@example.com' }, action: 'VIEW', resource_type: 'Data Asset', resource_id: 'employees_table', timestamp: new Date().toISOString() },
                        { id: 2, user: { full_name: 'Jane Smith', email: 'jane@example.com' }, action: 'EXPORT', resource_type: 'Report', resource_id: 'Q4_Sales', timestamp: new Date(Date.now() - 100000).toISOString() },
                        { id: 3, user: { full_name: 'System Admin', email: 'admin@example.com' }, action: 'DELETE', resource_type: 'User', resource_id: 'temp_user', timestamp: new Date(Date.now() - 500000).toISOString() },
                    ]);
                }
            } catch (e) { console.error(e); }
        };
        load();
    }, []);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'DELETE': return { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' };
            case 'EXPORT': return { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' };
            case 'VIEW': return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' };
            default: return { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' };
        }
    };

    return (
        <div className="premium-table-container animate-fade-in">
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="asset-icon-box icon-blue">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#111827' }}>Access Audit Log</h3>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>Track user activity and resource access history</p>
                    </div>
                </div>
                <button className="asset-count-badge" style={{ border: '1px solid #e5e7eb', cursor: 'pointer', background: 'white' }}>
                    Export CSV
                </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="premium-table">
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Resource</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map((log: any, i) => {
                            const colors = getActionColor(log.action);
                            return (
                                <tr key={i}>
                                    <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#6b7280' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-circle">
                                                {log.user?.full_name?.charAt(0) || <User size={14} />}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{log.user?.full_name || 'Unknown'}</div>
                                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>{log.user?.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="action-badge" style={{ backgroundColor: colors.bg, color: colors.text, borderColor: colors.border, borderTopWidth: 1, borderBottomWidth: 1, borderLeftWidth: 1, borderRightWidth: 1, borderStyle: 'solid' }}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500', color: '#374151' }}>{log.resource_id}</div>
                                        <div style={{ fontSize: '10px', textTransform: 'uppercase', color: '#9ca3af', fontWeight: '700', letterSpacing: '0.05em' }}>{log.resource_type}</div>
                                    </td>
                                    <td style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '12px' }}>
                                        -
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div style={{ padding: '16px 24px', background: '#f9fafb', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
                <span>Showing last {logs.length} events</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button style={{ padding: '4px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'not-allowed', color: '#d1d5db' }}>Previous</button>
                    <button style={{ padding: '4px 12px', background: 'white', border: '1px solid #e5e7eb', borderRadius: '4px', cursor: 'not-allowed', color: '#d1d5db' }}>Next</button>
                </div>
            </div>
        </div>
    );
};
