import React, { useState } from 'react';
import { DataCatalog } from '../components/governance/DataCatalog';
import { DataLineage } from '../components/governance/DataLineage';
import { QualityDashboard, AuditLog } from '../components/governance/QualityDashboard';
import { DocumentAccessAnalytics, ApprovalAnalytics } from '../components/governance/GovernanceAnalytics';
import { DocumentAccess } from '../components/governance/DocumentAccess'; // Import new component
import { Database, GitBranch, Activity, FileText, BarChart2, CheckSquare, ShieldCheck } from 'lucide-react';
import './Governance.css';

export const Governance: React.FC = () => {
    const [activeTab, setActiveTab] = useState('catalog');

    const tabs = [
        { id: 'catalog', label: 'Data Catalog', icon: Database },
        { id: 'lineage', label: 'Data Lineage', icon: GitBranch },
        { id: 'quality', label: 'Data Quality', icon: Activity },
        { id: 'doc_access', label: 'Document Access', icon: ShieldCheck }, // New Tab
        { id: 'audit', label: 'Audit Logs', icon: FileText },
        { id: 'access_analytics', label: 'Doc Access Analytics', icon: BarChart2 },
        { id: 'approval_analytics', label: 'Approval Analytics', icon: CheckSquare },
    ];

    return (
        <div className="gov-page">
            <div className="max-w-container">
                <div className="gov-header">
                    <h1 className="gov-title">
                        Data Governance <span className="gov-version-badge">v2.3 Compliance</span>
                    </h1>
                    <p className="gov-subtitle">Manage data assets, quality, lineage, and compliance audit trails.</p>
                </div>

                <div className="gov-tabs-container">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`gov-tab ${activeTab === tab.id ? 'active' : ''}`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {activeTab === 'catalog' && <DataCatalog />}
                    {activeTab === 'lineage' && <DataLineage />}
                    {activeTab === 'quality' && <QualityDashboard />}
                    {activeTab === 'doc_access' && <DocumentAccess />}
                    {activeTab === 'audit' && <AuditLog />}
                    {activeTab === 'access_analytics' && <DocumentAccessAnalytics />}
                    {activeTab === 'approval_analytics' && <ApprovalAnalytics />}
                </div>
            </div>
        </div>
    );
};
