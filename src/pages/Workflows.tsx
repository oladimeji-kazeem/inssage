import React, { useState } from 'react';
import {
    Plus, Search, Settings, MoreHorizontal,
    Zap, Activity, Clock
} from 'lucide-react';
import './Governance.css';

export const Workflows: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const workflows = [
        {
            id: 1,
            name: 'Daily CRM Sync',
            description: 'Syncs contacts from CRM to Database every morning',
            trigger: 'Schedule',
            cron: '0 8 * * *',
            status: 'ACTIVE',
            lastRun: 'Today at 9:00 AM'
        },
        {
            id: 2,
            name: 'New User Onboarding',
            description: 'Provisions accounts and sends welcome emails',
            trigger: 'Webhook',
            cron: 'Event: user.created',
            status: 'ACTIVE',
            lastRun: '10 mins ago'
        },
        {
            id: 3,
            name: 'Invoice Approval',
            description: 'Routes large invoices to finance director',
            trigger: 'Event',
            cron: 'invoice_amount > 5k',
            status: 'PAUSED',
            lastRun: 'Yesterday'
        }
    ];

    return (
        <div className="gov-page">
            <div className="max-w-container">

                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0 }}>Workflows</h1>
                        <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px' }}>Automate your business logic with visual workflows.</p>
                    </div>
                    <button style={{
                        backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px',
                        fontWeight: '600', border: 'none', display: 'flex', alignItems: 'center', gap: '8px',
                        cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                    }}>
                        <Plus size={18} /> New Workflow
                    </button>
                </div>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
                    {/* Active Workflows */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                            <Zap size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', lineHeight: '1' }}>1</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginTop: '6px', letterSpacing: '0.05em' }}>ACTIVE WORKFLOWS</div>
                        </div>
                    </div>

                    {/* Success Rate */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}>
                            <Activity size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', lineHeight: '1' }}>98.5%</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginTop: '6px', letterSpacing: '0.05em' }}>SUCCESS RATE</div>
                        </div>
                    </div>

                    {/* Avg Duration */}
                    <div style={{ background: 'white', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '12px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a855f7' }}>
                            <Clock size={28} />
                        </div>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '800', color: '#111827', lineHeight: '1' }}>1.2s</div>
                            <div style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', marginTop: '6px', letterSpacing: '0.05em' }}>AVG. DURATION</div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>

                    {/* Toolbar */}
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                            <input
                                placeholder="Search workflows..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%', padding: '10px 16px 10px 40px', borderRadius: '8px', border: '1px solid #e5e7eb',
                                    fontSize: '14px', outline: 'none', transition: 'box-shadow 0.2s'
                                }}
                            />
                        </div>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '8px',
                            border: '1px solid #e5e7eb', background: 'white', color: '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
                        }}>
                            <Settings size={16} /> Settings
                        </button>
                    </div>

                    {/* Table */}
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Workflow Name</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trigger</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Run</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workflows.map(wf => (
                                <tr key={wf.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: '#111827', marginBottom: '4px' }}>{wf.name}</div>
                                        <div style={{ fontSize: '13px', color: '#6b7280' }}>{wf.description}</div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <div style={{ display: 'inline-flex', alignItems: 'center', background: '#f3f4f6', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', color: '#374151' }}>
                                            <Clock size={12} style={{ marginRight: '6px' }} /> {wf.trigger}
                                        </div>
                                        <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px', fontFamily: 'monospace' }}>{wf.cron}</div>
                                    </td>
                                    <td style={{ padding: '20px 24px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                                            background: wf.status === 'ACTIVE' ? '#ecfdf5' : '#fffbeb',
                                            color: wf.status === 'ACTIVE' ? '#059669' : '#b45309',
                                            padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase'
                                        }}>
                                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor' }}></div> {wf.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '20px 24px', fontSize: '13px', color: '#4b5563' }}>
                                        {wf.lastRun}
                                    </td>
                                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}>
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
