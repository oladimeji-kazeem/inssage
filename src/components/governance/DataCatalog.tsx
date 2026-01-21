import React, { useState, useEffect } from 'react';
import { governanceService } from '../../services/governanceService';
import type { DataAsset } from '../../services/governanceService';
import { Search, Database, FileText, Globe, Server, Tag, Info } from 'lucide-react';
import '../../pages/Governance.css'; // Import the new styles

export const DataCatalog: React.FC = () => {
    const [assets, setAssets] = useState<DataAsset[]>([]);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterSensitivity, setFilterSensitivity] = useState('All');
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<DataAsset | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await governanceService.getAssets();
                setAssets(data || []);
                setError(null);
            } catch (e) {
                console.error("Failed to load data catalog:", e);
                setError("Could not load from database. Showing simulated schema.");
                // Fallback simulation data
                setAssets([
                    { id: '1', name: 'employees', type: 'Table', source: 'Postgres', sensitivity_level: 'Confidential', description: 'Master employee records including personal info, salary, and department.', tags: ['HR', 'Core'] },
                    { id: '2', name: 'departments', type: 'Table', source: 'Postgres', sensitivity_level: 'Internal', description: 'Organizational departments and budget codes.', tags: ['HR', 'Finance'] },
                    { id: '3', name: 'locations', type: 'Table', source: 'Postgres', sensitivity_level: 'Internal', description: 'Physical office locations and addresses.', tags: ['Operations'] },
                    { id: '4', name: 'documents', type: 'Table', source: 'Postgres', sensitivity_level: 'Confidential', description: 'Uploaded policy documents and contracts.', tags: ['Legal', 'GRC'] },
                    { id: '5', name: 'risks', type: 'Table', source: 'Postgres', sensitivity_level: 'Restricted', description: 'Enterprise risk registry and impact analysis.', tags: ['GRC', 'Risk'] },
                    { id: '6', name: 'programs', type: 'Table', source: 'Postgres', sensitivity_level: 'Internal', description: 'Compliance programs and initiatives.', tags: ['GRC'] },
                    { id: '7', name: 'cases_list', type: 'Table', source: 'Postgres', sensitivity_level: 'Confidential', description: 'Investigative cases and incident reports.', tags: ['Legal', 'Security'] },
                    { id: '8', name: 'app_roles', type: 'Table', source: 'Postgres', sensitivity_level: 'Internal', description: 'RBAC roles definition.', tags: ['IAM', 'Security'] },
                    { id: '9', name: 'audit_logs', type: 'Table', source: 'Postgres', sensitivity_level: 'Restricted', description: 'System access and activity logs.', tags: ['Audit', 'Security'] }
                ] as any);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading catalog...</div>;

    const filtered = assets.filter(a => {
        const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase()) ||
            a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
        const matchesType = filterType === 'All' || a.type === filterType;
        const matchesSensitivity = filterSensitivity === 'All' || a.sensitivity_level === filterSensitivity;
        return matchesSearch && matchesType && matchesSensitivity;
    });

    const getIconClass = (type: string) => {
        switch (type) {
            case 'Table': return 'icon-blue';
            case 'Report': return 'icon-green';
            case 'API': return 'icon-purple';
            case 'S3 Bucket': return 'icon-orange';
            default: return 'icon-blue';
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'Table': return <Database size={20} />;
            case 'Report': return <FileText size={20} />;
            case 'API': return <Globe size={20} />;
            case 'S3 Bucket': return <Server size={20} />;
            default: return <Database size={20} />;
        }
    };

    const getSensitivityClass = (level: string) => {
        switch (level) {
            case 'Public': return 'sens-public';
            case 'Internal': return 'sens-internal';
            case 'Confidential': return 'sens-confidential';
            case 'Restricted': return 'sens-restricted';
            default: return 'sens-internal';
        }
    };

    return (
        <div className="catalog-split-view">
            {/* Left Column: List */}
            <div className="catalog-list-col">
                {error && (
                    <div style={{ background: '#fffbeb', color: '#b45309', padding: '10px', borderRadius: '8px', fontSize: '14px', border: '1px solid #fde68a' }}>
                        <strong>Simulation Mode:</strong> {error}
                    </div>
                )}

                {/* Search & Filter Toolbar */}
                <div className="catalog-toolbar">
                    <div className="catalog-search-wrapper">
                        <Search className="catalog-search-icon" size={20} />
                        <input
                            className="catalog-search-input"
                            placeholder="Search data assets by name, description, or tag..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="catalog-filters">
                        <div className="filter-row">
                            <select
                                className="filter-select"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                            >
                                <option value="All">All Types</option>
                                <option value="Table">Table</option>
                                <option value="Report">Report</option>
                                <option value="API">API</option>
                                <option value="S3 Bucket">S3 Bucket</option>
                            </select>

                            <select
                                className="filter-select"
                                value={filterSensitivity}
                                onChange={(e) => setFilterSensitivity(e.target.value)}
                            >
                                <option value="All">All Levels</option>
                                <option value="Public">Public</option>
                                <option value="Internal">Internal</option>
                                <option value="Confidential">Confidential</option>
                                <option value="Restricted">Restricted</option>
                            </select>
                        </div>
                        <span className="asset-count-badge">{filtered.length} assets found</span>
                    </div>
                </div>

                {/* Asset List */}
                <div className="asset-grid">
                    {filtered.map(asset => (
                        <div
                            key={asset.id}
                            className={`asset-card ${selectedAsset?.id === asset.id ? 'selected' : ''}`}
                            onClick={() => setSelectedAsset(asset)}
                        >
                            <div className="asset-header">
                                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                                    <div className={`asset-icon-box ${getIconClass(asset.type)}`}>
                                        {getIcon(asset.type)}
                                    </div>
                                    <div>
                                        <h3 className="asset-title">{asset.name}</h3>
                                        <div className="asset-meta">
                                            {asset.source} • {asset.type}
                                        </div>
                                    </div>
                                </div>
                                <span className={`sensitivity-badge ${getSensitivityClass(asset.sensitivity_level)}`}>
                                    {asset.sensitivity_level}
                                </span>
                            </div>

                            <p className="asset-desc">{asset.description}</p>

                            {asset.tags && asset.tags.length > 0 && (
                                <div className="asset-tags">
                                    {asset.tags.map(tag => (
                                        <span key={tag} className="asset-tag">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Column: Details Panel */}
            <div className="catalog-detail-col">
                {selectedAsset ? (
                    <>
                        {/* Header */}
                        <div className="detail-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                <div className={`asset-icon-box ${getIconClass(selectedAsset.type)}`}>
                                    {getIcon(selectedAsset.type)}
                                </div>
                                <div>
                                    <h2 className="detail-title">{selectedAsset.name}</h2>
                                    <span className="detail-subtitle">Asset Detail View</span>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>Owner</div>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{(selectedAsset as any).owner?.full_name || 'Data Team'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' }}>Source</div>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>{selectedAsset.source}</div>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="detail-content">
                            <section>
                                <h4 style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', color: '#374151', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Database size={16} color="#4f46e5" /> Schema Definitions
                                </h4>
                                {selectedAsset.definitions && selectedAsset.definitions.length > 0 ? (
                                    <div className="schema-table">
                                        <div style={{ background: '#f9fafb', padding: '8px 12px', borderBottom: '1px solid #e5e7eb', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: '#6b7280', display: 'flex' }}>
                                            <div style={{ flex: 1 }}>Field Name</div>
                                            <div style={{ width: '60px' }}>Type</div>
                                        </div>
                                        {selectedAsset.definitions.map(def => (
                                            <div key={def.id} className="schema-row">
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <span className="schema-field">{def.field_name}</span>
                                                        {def.is_pii && (
                                                            <span style={{ fontSize: '10px', background: '#fef2f2', color: '#ef4444', padding: '2px 6px', borderRadius: '4px', border: '1px solid #fecaca', fontWeight: 'bold' }}>PII</span>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{def.description}</div>
                                                </div>
                                                <div style={{ width: '60px', fontSize: '11px', fontFamily: 'monospace', color: '#6b7280' }}>{def.data_type}</div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="schema-empty">
                                        No schema definitions available for this asset.
                                    </div>
                                )}
                            </section>
                        </div>

                        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb', background: '#f9fafb' }}>
                            <button style={{ width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}>
                                Request Access
                            </button>
                        </div>
                    </>
                ) : (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', padding: '32px' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <Info size={32} />
                        </div>
                        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>No Asset Selected</h3>
                        <p style={{ textAlign: 'center', fontSize: '14px' }}>Select a data asset to view details.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
