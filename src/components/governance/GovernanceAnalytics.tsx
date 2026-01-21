import React from 'react';
import {
    FileText, Users, ShieldAlert, ExternalLink,
    CheckCircle, XCircle, Clock, AlertCircle, TrendingUp
} from 'lucide-react';
import '../../pages/Governance.css'; // Global CSS

export const DocumentAccessAnalytics: React.FC = () => {
    return (
        <div className="animate-fade-in">
            {/* KPI Cards */}
            <div className="analytics-grid-4">
                <div className="kpi-card kpi-blue">
                    <div>
                        <div className="kpi-label">Total Access Events</div>
                        <div className="kpi-value">24,592</div>
                        <div className="kpi-trend trend-up">
                            <TrendingUp size={14} /> +12% vs last month
                        </div>
                    </div>
                    <div className="kpi-icon icon-blue"><FileText size={18} /></div>
                </div>

                <div className="kpi-card kpi-indigo">
                    <div>
                        <div className="kpi-label">Active Users</div>
                        <div className="kpi-value">1,840</div>
                        <div className="kpi-trend trend-up">
                            <TrendingUp size={14} /> +5% new interactions
                        </div>
                    </div>
                    <div className="kpi-icon icon-purple"><Users size={18} /></div>
                </div>

                <div className="kpi-card kpi-orange">
                    <div>
                        <div className="kpi-label">Restricted Access</div>
                        <div className="kpi-value">142</div>
                        <div className="kpi-trend trend-down">
                            <ShieldAlert size={14} /> +3 denied attempts
                        </div>
                    </div>
                    <div className="kpi-icon icon-orange"><ShieldAlert size={18} /></div>
                </div>

                <div className="kpi-card kpi-red">
                    <div>
                        <div className="kpi-label">External Shares</div>
                        <div className="kpi-value">89</div>
                        <div className="kpi-trend trend-neutral">
                            Stable
                        </div>
                    </div>
                    <div className="kpi-icon icon-green"><ExternalLink size={18} /></div>
                </div>
            </div>

            {/* Charts & Lists Split */}
            <div className="analytics-split-layout">
                {/* Manual CSS Bar Chart */}
                <div className="chart-container">
                    <div className="chart-header-row">
                        <h3 className="chart-title">Document Access Volume (30 Days)</h3>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>All Departments</div>
                    </div>

                    <div className="bar-chart-area">
                        {[45, 60, 55, 70, 80, 65, 90, 85, 95, 100, 80, 75, 60, 50, 65, 70, 85, 90, 95, 100, 110, 105, 95, 85, 80, 75, 70, 65, 60, 55].map((h, i) => (
                            <div key={i} className="bar-col" style={{ height: `${h}%` }}>
                                <div className="bar-tooltip">{h * 10} Events</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11px', color: '#9ca3af' }}>
                        <span>30 Days Ago</span>
                        <span>Today</span>
                    </div>
                </div>

                {/* Top Documents List */}
                <div className="list-card">
                    <div className="list-header">
                        Most Accessed Files
                    </div>
                    <div className="list-body">
                        {[
                            { name: 'Q4_Financial_Report.pdf', count: 1245, type: 'Confidential', tagClass: 'sens-confidential' },
                            { name: 'Employee_Handbook_2024.docx', count: 982, type: 'Internal', tagClass: 'sens-internal' },
                            { name: 'Product_Roadmap_v3.pptx', count: 850, type: 'Internal', tagClass: 'sens-internal' },
                            { name: 'Client_List_Jan.xlsx', count: 620, type: 'Restricted', tagClass: 'sens-restricted' },
                            { name: 'Security_Audit_Log.csv', count: 415, type: 'Restricted', tagClass: 'sens-restricted' },
                        ].map((doc, i) => (
                            <div key={i} className="list-item">
                                <div style={{ minWidth: 0 }}>
                                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {doc.name}
                                    </div>
                                    <span className={`sensitivity-badge ${doc.tagClass}`} style={{ marginTop: '4px', display: 'inline-block' }}>
                                        {doc.type}
                                    </span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>{doc.count}</div>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase' }}>Views</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ApprovalAnalytics: React.FC = () => {
    return (
        <div className="animate-fade-in">
            {/* KPI Cards */}
            <div className="analytics-grid-4">
                <div className="kpi-card kpi-orange">
                    <div>
                        <div className="kpi-label">Pending Requests</div>
                        <div className="kpi-value">24</div>
                        <div className="kpi-trend trend-neutral" style={{ color: '#d97706' }}>
                            Due within 48h
                        </div>
                    </div>
                    <div className="kpi-icon icon-orange"><Clock size={18} /></div>
                </div>

                <div className="kpi-card kpi-green">
                    <div>
                        <div className="kpi-label">Avg Approval Time</div>
                        <div className="kpi-value">4.2h</div>
                        <div className="kpi-trend trend-up">
                            -1.5h vs last week
                        </div>
                    </div>
                    <div className="kpi-icon icon-green"><CheckCircle size={18} /></div>
                </div>

                <div className="kpi-card kpi-red">
                    <div>
                        <div className="kpi-label">Rejection Rate</div>
                        <div className="kpi-value">3.8%</div>
                        <div className="kpi-trend trend-neutral">
                            Industry avg: 5.0%
                        </div>
                    </div>
                    <div className="kpi-icon icon-purple"><XCircle size={18} /></div>
                </div>

                <div className="kpi-card kpi-blue">
                    <div>
                        <div className="kpi-label">Escalations</div>
                        <div className="kpi-value">2</div>
                        <div className="kpi-trend trend-down">
                            Requires VP Review
                        </div>
                    </div>
                    <div className="kpi-icon icon-blue"><AlertCircle size={18} /></div>
                </div>
            </div>

            <div className="analytics-split-layout">
                {/* Approval Pipeline */}
                <div className="list-card" style={{ flex: 1 }}>
                    <div className="list-header">
                        Approval Workflow Bottlenecks
                        <span className="asset-count-badge">Last 7 Days</span>
                    </div>
                    <div className="list-body">
                        {[
                            { stage: 'Manager Review', avgTime: '2.5h', count: 145, color: '#22c55e' },
                            { stage: 'Security Assessment', avgTime: '18h', count: 42, color: '#f59e0b' },
                            { stage: 'Legal Compliance', avgTime: '36h', count: 12, color: '#ef4444' },
                            { stage: 'Final Provisioning', avgTime: '0.5h', count: 180, color: '#3b82f6' },
                        ].map((stage, i) => (
                            <div key={i} className="workflow-item">
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 500, color: '#374151' }}>{stage.stage}</span>
                                    <span style={{ color: '#6b7280' }}>{stage.avgTime} avg</span>
                                </div>
                                <div className="progress-track">
                                    <div className="progress-fill" style={{ width: `${Math.min(100, (stage.count / 200) * 100)}%`, backgroundColor: stage.color }}></div>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                                    {stage.count} requests
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Feed */}
                <div className="list-card" style={{ flex: 1 }}>
                    <div className="list-header">
                        Recent Decisions
                    </div>
                    <div className="list-body">
                        {[
                            { user: 'Sarah Connor', action: 'Approved', item: 'AWS Access', time: '10m ago', color: '#22c55e' },
                            { user: 'Mike Ross', action: 'Rejected', item: 'Admin Roles', time: '1h ago', color: '#ef4444' },
                            { user: 'Jessica Pearson', action: 'Approved', item: 'Q4 Data', time: '2h ago', color: '#22c55e' },
                            { user: 'Harvey Specter', action: 'Escalated', item: 'Merge Request', time: '4h ago', color: '#f59e0b' },
                            { user: 'Louis Litt', action: 'Approved', item: 'New Hire Setup', time: '5h ago', color: '#22c55e' },
                        ].map((activity, i) => (
                            <div key={i} className="timeline-item">
                                <div className="timeline-dot" style={{ backgroundColor: activity.color }}></div>
                                <div>
                                    <p style={{ fontSize: '13px', color: '#111827', margin: 0, lineHeight: '1.4' }}>
                                        <span style={{ fontWeight: 600 }}>{activity.user}</span> {activity.action} access for <span style={{ fontWeight: 600 }}>{activity.item}</span>.
                                    </p>
                                    <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
