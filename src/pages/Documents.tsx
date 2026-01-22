import React, { useEffect, useState, useRef } from 'react';
import { FileText, MoreHorizontal, AlertTriangle, Upload, X, Edit, UserPlus, Trash2, Loader, Search } from 'lucide-react';
// import { Button } from '../components/ui/Button'; // Kept for logic, but might override styles
// import { Badge } from '../components/ui/Badge';
// import { Card } from '../components/ui/Card';
import { analyticsService } from '../services/analyticsService';
import './Documents.css';

interface Document {
  id: string;
  title: string;
  type: string;
  updated_at: string;
  status: string;
  risk_level: string;
  guardrails_count?: number;
  owner?: {
    id?: string;
    full_name: string;
    department: string;
  };
  owner_id?: string;
  applicable_department?: string;
  complianceRate?: number;
}

interface Employee {
  id: string;
  full_name: string;
  department: string;
}

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Form Data
  const [formData, setFormData] = useState<Partial<Document>>({});

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterRisk, setFilterRisk] = useState('All');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchEmployees();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest('.doc-action-menu')) return;
      setOpenMenuId(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await analyticsService.getEmployeesData();
      setEmployees(data || []);
    } catch (e) { console.error(e); }
  };

  const fetchDocuments = async () => {
    try {
      // Seed first to ensure data (Dev Mode) - Non-blocking
      try {
        await analyticsService.seedDocumentsData();
      } catch (seedErr) {
        console.warn("Seeding failed, proceeding to fetch:", seedErr);
      }

      const data = await analyticsService.getDocumentsData();

      // Fetch compliance stats
      const docsWithStats = await Promise.all((data || []).map(async (doc: any) => {
        let stats = { complianceRate: 0 };
        try {
          stats = await analyticsService.getComplianceStats(doc.id);
        } catch (e) { /* ignore */ }

        return {
          id: doc.id,
          title: doc.title,
          type: doc.type,
          updated_at: new Date(doc.created_at).toLocaleDateString(),
          status: doc.status,
          risk_level: doc.risk_level,
          guardrails_count: doc.guardrails_count,
          owner: doc.owner, // Joined data
          owner_id: doc.owner_id,
          applicable_department: doc.applicable_department,
          complianceRate: stats.complianceRate
        };
      }));

      setDocuments(docsWithStats);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await analyticsService.uploadDocumentFile(file);
      const uniqueTitle = `${file.name.replace(/\.[^/.]+$/, "")} (${new Date().toLocaleString()})`;

      await analyticsService.createDocumentRecord({
        title: uniqueTitle,
        type: 'Policy',
        status: 'Draft',
        risk_level: 'Low',
        file_url: url,
        version: '1.0'
      });

      await fetchDocuments();
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Check console.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this document?")) return;
    try {
      await analyticsService.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error(error);
      alert("Delete failed.");
    }
  };

  const handleUpdate = async () => {
    if (!selectedDoc) return;
    try {
      await analyticsService.updateDocument(selectedDoc.id, formData);
      setIsEditModalOpen(false);
      setIsAssignModalOpen(false);
      fetchDocuments(); // Refresh
    } catch (e) {
      console.error(e);
      alert("Update failed.");
    }
  };

  const openEdit = (doc: Document) => {
    setSelectedDoc(doc);
    setFormData({
      title: doc.title,
      type: doc.type,
      status: doc.status,
      risk_level: doc.risk_level
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const openAssign = (doc: Document) => {
    setSelectedDoc(doc);
    setFormData({
      owner_id: doc.owner_id,
      applicable_department: doc.applicable_department || ''
    });
    setIsAssignModalOpen(true);
    setOpenMenuId(null);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.owner?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || doc.type === filterType;
    const matchesRisk = filterRisk === 'All' || doc.risk_level === filterRisk;
    return matchesSearch && matchesType && matchesRisk;
  });

  return (
    <div className="documents-page">
      <div className="max-w-container">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className="premium-title">
              Documents <span className="version-badge">v2.1 Premium</span>
            </h1>
            <p className="premium-subtitle">Manage policies, SOPs, and governance guardrails centrally.</p>
          </div>
          <div>
            <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
            <button className="btn-upload" onClick={handleUploadClick} disabled={uploading}>
              {uploading ? <Loader className="animate-spin" size={20} /> : <Upload size={20} />}
              {uploading ? 'Uploading...' : 'Upload New'}
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="toolbar-container">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Search by document title or owner..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div className="custom-select-wrapper">
              <span className="select-label">Type</span>
              <select
                className="custom-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="All">All Types</option>
                <option value="Policy">Policy</option>
                <option value="Procedure">Procedure</option>
                <option value="Report">Report</option>
              </select>
            </div>

            <div className="custom-select-wrapper">
              <span className="select-label">Risk</span>
              <select
                className="custom-select"
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
              >
                <option value="All">All Risks</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>
        </div>

        <div className="table-card">
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#9ca3af' }}>
              <Loader className="animate-spin" size={32} style={{ margin: '0 auto 16px', color: '#4f46e5' }} />
              <span>Loading documents repository...</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="doc-table">
                <thead>
                  <tr>
                    <th style={{ width: '35%' }}>Document Name</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th style={{ width: '20%' }}>Compliance</th>
                    <th>Status</th>
                    <th>Risk</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '60px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '64px', height: '64px', background: '#f3f4f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                            <FileText size={32} color="#9ca3af" />
                          </div>
                          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}>No documents found</h3>
                          <p style={{ color: '#6b7280' }}>Try adjusting your filters or search query.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td>
                          <div className="doc-title-row">
                            <div className="icon-box">
                              <FileText size={20} />
                            </div>
                            <div>
                              <div className="doc-title">{doc.title}</div>
                              <div className="doc-meta">v1.0 • {doc.updated_at}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="type-pill">{doc.type}</span>
                        </td>
                        <td>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{doc.owner?.full_name || 'Unassigned'}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>{doc.owner?.department}</div>
                        </td>
                        <td>
                          {doc.type === 'Policy' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ flex: 1 }}>
                                <div className="compliance-bar-bg">
                                  <div
                                    className={`compliance-fill ${(doc.complianceRate || 0) > 80 ? 'fill-green' : (doc.complianceRate || 0) > 50 ? 'fill-yellow' : 'fill-red'
                                      }`}
                                    style={{ width: `${doc.complianceRate || 0}%` }}
                                  />
                                </div>
                              </div>
                              <span style={{ fontSize: '12px', fontWeight: '700', width: '30px' }}>{doc.complianceRate || 0}%</span>
                            </div>
                          ) : <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Not Applicable</span>}
                        </td>
                        <td>
                          <span className={`status-badge status-${doc.status === 'Active' ? 'active' : doc.status === 'Review Needed' ? 'warning' : 'draft'}`}>
                            {doc.status}
                          </span>
                        </td>
                        <td>
                          <div className={`risk-level risk-${doc.risk_level.toLowerCase()}`}>
                            {doc.risk_level === 'High' || doc.risk_level === 'Critical' ? <AlertTriangle size={16} /> : null}
                            <span>{doc.risk_level}</span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ position: 'relative' }} className="doc-action-menu">
                            <button
                              style={{ padding: '8px', color: '#9ca3af', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'transparent' }}
                              onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                            >
                              <MoreHorizontal size={20} />
                            </button>

                            {openMenuId === doc.id && (
                              <div style={{
                                position: 'absolute', right: 0, top: '100%', width: '180px', background: 'white',
                                border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                zIndex: 50, padding: '4px', overflow: 'hidden'
                              }}>
                                <button className="menu-item" onClick={() => openEdit(doc)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', padding: '10px', fontSize: '14px', color: '#374151', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                                  <Edit size={16} /> Edit Details
                                </button>
                                <button className="menu-item" onClick={() => openAssign(doc)} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', padding: '10px', fontSize: '14px', color: '#374151', border: 'none', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                                  <UserPlus size={16} /> Assign Owner
                                </button>
                                <button className="menu-item" onClick={() => { handleDelete(doc.id); setOpenMenuId(null); }} style={{ display: 'flex', width: '100%', alignItems: 'center', gap: '8px', padding: '10px', fontSize: '14px', color: '#ef4444', borderTop: '1px solid #f3f4f6', background: 'transparent', cursor: 'pointer', textAlign: 'left' }}>
                                  <Trash2 size={16} /> Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )))
                  }
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* EDIT MODAL */}
        {isEditModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Edit Metadata</h3>
                <button onClick={() => setIsEditModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} color="#9ca3af" /></button>
              </div>

              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Title</label>
                  <input className="form-input" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label className="form-label">Type</label>
                    <select className="form-select" value={formData.type || 'Policy'} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                      <option value="Policy">Policy</option>
                      <option value="Procedure">Procedure</option>
                      <option value="Report">Report</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Status</label>
                    <select className="form-select" value={formData.status || 'Draft'} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                      <option value="Draft">Draft</option>
                      <option value="Active">Active</option>
                      <option value="Review Needed">Review Needed</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="form-label">Risk Level</label>
                  <select className="form-select" value={formData.risk_level || 'Low'} onChange={e => setFormData({ ...formData, risk_level: e.target.value })}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button className="btn-save" onClick={handleUpdate}>Save Changes</button>
              </div>
            </div>
          </div>
        )}

        {/* ASSIGN MODAL */}
        {isAssignModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>Assign Document</h3>
                <button onClick={() => setIsAssignModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} color="#9ca3af" /></button>
              </div>

              <div className="modal-body">
                <div style={{ marginBottom: '16px' }}>
                  <label className="form-label">Owner</label>
                  <select className="form-select" value={formData.owner_id || ''} onChange={e => setFormData({ ...formData, owner_id: e.target.value })}>
                    <option value="">-- Unassigned --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.department})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Department</label>
                  <select className="form-select" value={formData.applicable_department || 'All'} onChange={e => setFormData({ ...formData, applicable_department: e.target.value })}>
                    <option value="All">All Departments</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Legal">Legal</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setIsAssignModalOpen(false)}>Cancel</button>
                <button className="btn-save" onClick={handleUpdate}>Assign Owner</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
