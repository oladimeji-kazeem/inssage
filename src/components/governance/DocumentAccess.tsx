import React, { useState } from 'react';
import {
    Search, CheckCircle, Clock,
    AlertCircle, FileText
} from 'lucide-react';
import '../../pages/Governance.css';

interface AccessRecord {
    id: string;
    employee: {
        name: string;
        email: string;
        department: string;
    };
    document: {
        name: string;
        type: string;
    };
    status: 'Accepted' | 'Read' | 'Pending' | 'Overdue';
    last_activity: string;
}

export const DocumentAccess: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Mock Data
    const records: AccessRecord[] = [
        { id: '1', employee: { name: 'Sarah Connor', email: 'sarah@inssage.com', department: 'Engineering' }, document: { name: 'IT Security Policy 2024', type: 'Policy' }, status: 'Accepted', last_activity: '2024-01-20T10:30:00' },
        { id: '2', employee: { name: 'John Doe', email: 'john@inssage.com', department: 'Sales' }, document: { name: 'Code of Conduct', type: 'Policy' }, status: 'Read', last_activity: '2024-01-21T09:15:00' },
        { id: '3', employee: { name: 'Mike Ross', email: 'mike@inssage.com', department: 'Legal' }, document: { name: 'Data Privacy Guidelines', type: 'Guideline' }, status: 'Pending', last_activity: '2024-01-15T14:20:00' },
        { id: '4', employee: { name: 'Jessica Pearson', email: 'jessica@inssage.com', department: 'Executive' }, document: { name: 'Insider Trading Policy', type: 'Policy' }, status: 'Accepted', last_activity: '2024-01-10T11:00:00' },
        { id: '5', employee: { name: 'Louis Litt', email: 'louis@inssage.com', department: 'Legal' }, document: { name: 'Employee Handbook', type: 'Handbook' }, status: 'Overdue', last_activity: '2023-12-28T16:45:00' },
        { id: '6', employee: { name: 'Rachel Zane', email: 'rachel@inssage.com', department: 'Legal' }, document: { name: 'IT Security Policy 2024', type: 'Policy' }, status: 'Accepted', last_activity: '2024-01-19T13:30:00' },
        { id: '7', employee: { name: 'Harvey Specter', email: 'harvey@inssage.com', department: 'Legal' }, document: { name: 'Remote Work Policy', type: 'Policy' }, status: 'Read', last_activity: '2024-01-18T09:00:00' },
        { id: '8', employee: { name: 'Donna Paulsen', email: 'donna@inssage.com', department: 'Operations' }, document: { name: 'Office Safety Protocols', type: 'Protocol' }, status: 'Accepted', last_activity: '2024-01-20T15:10:00' },
    ];

    const filteredRecords = records.filter(record => {
        const matchesSearch = record.employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.document.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All' || record.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Accepted': return 'sens-public'; // Greenish
            case 'Read': return 'sens-internal'; // Blueish
            case 'Pending': return 'sens-confidential'; // Orange/Yellow
            case 'Overdue': return 'sens-restricted'; // Red
            default: return 'asset-tag';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Accepted': return <CheckCircle size={14} />;
            case 'Read': return <FileText size={14} />;
            case 'Pending': return <Clock size={14} />;
            case 'Overdue': return <AlertCircle size={14} />;
            default: return null;
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* KPI Overview */}
            <div className="analytics-grid-4">
                <div className="kpi-card kpi-green">
                    <div>
                        <div className="kpi-label">Compliance Rate</div>
                        <div className="kpi-value">87%</div>
                        <div className="kpi-trend trend-up">
                            Target: 95%
                        </div>
                    </div>
                    <div className="kpi-icon icon-green"><CheckCircle size={18} /></div>
                </div>
                <div className="kpi-card kpi-orange">
                    <div>
                        <div className="kpi-label">Pending Reviews</div>
                        <div className="kpi-value">24</div>
                        <div className="kpi-trend trend-neutral">
                            Across 3 departments
                        </div>
                    </div>
                    <div className="kpi-icon icon-orange"><Clock size={18} /></div>
                </div>
                <div className="kpi-card kpi-red">
                    <div>
                        <div className="kpi-label">Overdue Acknowledgment</div>
                        <div className="kpi-value">12</div>
                        <div className="kpi-trend trend-down">
                            Urgent attention needed
                        </div>
                    </div>
                    <div className="kpi-icon icon-purple"><AlertCircle size={18} /></div>
                </div>
                <div className="kpi-card kpi-blue">
                    <div>
                        <div className="kpi-label">Total Documents Assigned</div>
                        <div className="kpi-value">1,250</div>
                        <div className="kpi-trend trend-up">
                            +5 new policies this Q
                        </div>
                    </div>
                    <div className="kpi-icon icon-blue"><FileText size={18} /></div>
                </div>
            </div>

            <div className="premium-table-container">
                {/* Toolbar */}
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', background: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div className="catalog-search-wrapper" style={{ minWidth: '300px' }}>
                        <Search className="catalog-search-icon" size={18} />
                        <input
                            className="catalog-search-input"
                            placeholder="Search employee or document..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 16px 10px 42px', fontSize: '14px' }}
                        />
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                        {['All', 'Accepted', 'Read', 'Pending', 'Overdue'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`asset-count-badge ${filterStatus === status ? 'active' : ''}`}
                                style={{
                                    cursor: 'pointer',
                                    background: filterStatus === status ? '#111827' : 'white',
                                    color: filterStatus === status ? 'white' : '#6b7280',
                                    border: filterStatus === status ? '1px solid #111827' : '1px solid #e5e7eb',
                                    padding: '6px 14px'
                                }}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Employee</th>
                                <th>Department</th>
                                <th>Document</th>
                                <th>Status</th>
                                <th>Last Activity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRecords.map(record => (
                                <tr key={record.id}>
                                    <td>
                                        <div className="user-cell">
                                            <div className="avatar-circle">
                                                {record.employee.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: '600', color: '#111827' }}>{record.employee.name}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{record.employee.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="asset-tag">{record.employee.department}</span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: '500', color: '#374151' }}>{record.document.name}</span>
                                            <span style={{ fontSize: '11px', color: '#9ca3af' }}>{record.document.type}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`sensitivity-badge ${getStatusStyle(record.status)}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                            {getStatusIcon(record.status)} {record.status}
                                        </span>
                                    </td>
                                    <td style={{ color: '#6b7280', fontSize: '13px' }}>
                                        {new Date(record.last_activity).toLocaleDateString()}
                                        <span style={{ display: 'block', fontSize: '11px', color: '#9ca3af' }}>
                                            {new Date(record.last_activity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
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
