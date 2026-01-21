import React, { useState } from 'react';
import {
    Search, Sliders, CheckCircle, Plus, ExternalLink,
    MessageSquare, Github, Cloud, Mail, FileText,
    Briefcase, CreditCard, Server, Box as BoxIcon // Lucide Box is better
} from 'lucide-react';
import './Governance.css'; // Reusing global premium styles

interface IntegrationApp {
    id: string;
    name: string;
    description: string;
    category: 'Communication' | 'Development' | 'Storage' | 'CRM' | 'Security' | 'Finance';
    icon: React.ReactNode;
    status: 'Connected' | 'Available' | 'Maintenance';
    color: string; // Helper for icon styling
}

export const Integrations: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const apps: IntegrationApp[] = [
        // Communication
        { id: 'slack', name: 'Slack', description: 'Real-time messaging and operational alerts.', category: 'Communication', icon: <MessageSquare size={22} />, status: 'Connected', color: 'icon-purple' },
        { id: 'teams', name: 'Microsoft Teams', description: 'Collaborate and share data contexts.', category: 'Communication', icon: <MessageSquare size={22} />, status: 'Available', color: 'icon-blue' },
        { id: 'outlook', name: 'Outlook 365', description: 'Email integration for notifications.', category: 'Communication', icon: <Mail size={22} />, status: 'Available', color: 'icon-blue' },

        // Development
        { id: 'github', name: 'GitHub', description: 'Code repositories and issue tracking.', category: 'Development', icon: <Github size={22} />, status: 'Connected', color: 'icon-green' },
        { id: 'jira', name: 'Jira Software', description: 'Project tracking and agile planning.', category: 'Development', icon: <Sliders size={22} />, status: 'Connected', color: 'icon-blue' },

        // Storage
        { id: 'gdrive', name: 'Google Drive', description: 'Access documents and spreadsheets.', category: 'Storage', icon: <Cloud size={22} />, status: 'Available', color: 'icon-green' },
        { id: 'dropbox', name: 'Dropbox', description: 'Secure file sharing and storage.', category: 'Storage', icon: <BoxIcon size={22} />, status: 'Available', color: 'icon-blue' },
        { id: 'aws', name: 'AWS S3', description: 'Object storage for data lakes.', category: 'Storage', icon: <Server size={22} />, status: 'Connected', color: 'icon-orange' },

        // Sales & CRM
        { id: 'salesforce', name: 'Salesforce', description: 'Customer relationship management.', category: 'CRM', icon: <Briefcase size={22} />, status: 'Available', color: 'icon-blue' },
        { id: 'hubspot', name: 'HubSpot', description: 'Inbound marketing and sales software.', category: 'CRM', icon: <Briefcase size={22} />, status: 'Available', color: 'icon-orange' },

        // Finance
        { id: 'stripe', name: 'Stripe', description: 'Payment processing and analytics.', category: 'Finance', icon: <CreditCard size={22} />, status: 'Available', color: 'icon-purple' },
        { id: 'xero', name: 'Xero', description: 'Accounting software integration.', category: 'Finance', icon: <FileText size={22} />, status: 'Available', color: 'icon-blue' },
    ];

    const categories = ['All', 'Communication', 'Development', 'Storage', 'CRM', 'Finance'];

    const filteredApps = apps.filter(app => {
        const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="gov-page">
            <div className="max-w-container">
                {/* Header */}
                <div className="gov-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h1 className="gov-title">Integrations Marketplace</h1>
                            <p className="gov-subtitle">Supercharge your workflow by connecting your favorite tools.</p>
                        </div>
                        <button className="btn-upload" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <Plus size={18} /> Request Integration
                        </button>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="catalog-toolbar" style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div className="catalog-search-wrapper" style={{ width: '320px' }}>
                        <Search className="catalog-search-icon" size={20} />
                        <input
                            className="catalog-search-input"
                            placeholder="Search apps..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="catalog-filters" style={{ gap: '8px' }}>
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`asset-count-badge ${selectedCategory === cat ? 'active' : ''}`}
                                style={{
                                    cursor: 'pointer',
                                    background: selectedCategory === cat ? '#111827' : 'white',
                                    color: selectedCategory === cat ? 'white' : '#6b7280',
                                    border: selectedCategory === cat ? '1px solid #111827' : '1px solid #e5e7eb',
                                    padding: '8px 16px',
                                    fontSize: '13px'
                                }}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="asset-grid" style={{ paddingBottom: '40px', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {filteredApps.map(app => (
                        <div key={app.id} className={`asset-card ${app.status === 'Connected' ? 'selected' : ''}`} style={{ minHeight: '220px' }}>
                            <div>
                                <div className="asset-header">
                                    <div className="flex items-center gap-3">
                                        <div className={`asset-icon-box ${app.color}`}>
                                            {app.icon}
                                        </div>
                                        <div>
                                            <h3 className="asset-title">{app.name}</h3>
                                            <div className="asset-meta">
                                                {app.category}
                                            </div>
                                        </div>
                                    </div>
                                    {app.status === 'Connected' && (
                                        <div className="sensitivity-badge sens-public" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <CheckCircle size={10} /> Active
                                        </div>
                                    )}
                                </div>

                                <p className="asset-desc" style={{ paddingLeft: 0, marginTop: '16px', marginBottom: '24px' }}>
                                    {app.description}
                                </p>
                            </div>

                            <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'flex-end' }}>
                                {app.status === 'Connected' ? (
                                    <button style={{ fontSize: '13px', fontWeight: '600', color: '#111827', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        Manage <ExternalLink size={14} />
                                    </button>
                                ) : (
                                    <button style={{ fontSize: '13px', fontWeight: '600', color: '#4f46e5', background: '#eef2ff', padding: '6px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}>
                                        Connect
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {filteredApps.length === 0 && (
                    <div className="schema-empty">
                        <Sliders size={40} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827' }}>No integrations found</h3>
                        <p style={{ marginTop: '8px' }}>Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
