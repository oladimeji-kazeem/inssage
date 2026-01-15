import React, { useEffect, useState, useRef } from 'react';
import { FileText, MoreHorizontal, CheckCircle, AlertTriangle, Upload, X, Edit, UserPlus, Trash2, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
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

      // Timestamp to avoid duplicate title
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

  return (
    <div className="documents-page">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold mb-1">Documents</h1>
          <p className="text-secondary">Manage policies, SOPs, and governance guardrails.</p>
        </div>
        <div>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
          <Button onClick={handleUploadClick} disabled={uploading}>
            {uploading ? <Loader className="animate-spin mr-2" size={18} /> : <Upload size={18} className="mr-2" />}
            {uploading ? 'Uploading...' : 'Upload New'}
          </Button>
        </div>
      </div>

      <Card className="documents-card">
        {loading ? (
          <div className="p-8 flex justify-center text-secondary">
            <Loader className="animate-spin mr-2" /> Loading documents...
          </div>
        ) : (
          <table className="documents-table">
            <thead>
              <tr>
                <th>Document Name</th>
                <th>Type</th>
                <th>Owner</th>
                <th>Compliance</th>
                <th>Last Updated</th>
                <th>Status</th>
                <th>Risk Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr><td colSpan={8} className="text-center p-8 text-secondary">No documents found.</td></tr>
              ) : (
                documents.map((doc, idx) => (
                  <tr key={doc.id}>
                    <td data-label="Document Name">
                      <div className="flex items-center gap-3">
                        <div className="doc-icon"><FileText size={20} className="text-primary" /></div>
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-xs text-secondary">v1.0</div>
                        </div>
                      </div>
                    </td>
                    <td data-label="Type"><Badge variant="neutral">{doc.type}</Badge></td>
                    <td data-label="Owner">
                      <div className="text-sm font-medium">{doc.owner?.full_name || 'Unassigned'}</div>
                      <div className="text-xs text-secondary">{doc.owner?.department}</div>
                    </td>
                    <td data-label="Compliance">
                      {doc.type === 'Policy' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${(doc.complianceRate || 0) > 80 ? 'bg-green-500' : (doc.complianceRate || 0) > 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${doc.complianceRate || 0}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{doc.complianceRate || 0}%</span>
                        </div>
                      ) : <span className="text-xs text-secondary">N/A</span>}
                    </td>
                    <td data-label="Last Updated" className="text-secondary">{doc.updated_at}</td>
                    <td data-label="Status">
                      <Badge variant={doc.status === 'Active' ? 'success' : doc.status === 'Review Needed' ? 'warning' : 'neutral'}>
                        {doc.status}
                      </Badge>
                    </td>
                    <td data-label="Risk Level">
                      <div className="flex items-center gap-1">
                        {doc.risk_level === 'High' || doc.risk_level === 'Critical' ? <AlertTriangle size={14} className="text-red-500" /> : null}
                        <span className={doc.risk_level === 'High' || doc.risk_level === 'Critical' ? 'text-red-600 font-medium' : ''}>{doc.risk_level}</span>
                      </div>
                    </td>
                    <td data-label="Actions">
                      <div className="doc-action-menu">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenMenuId(openMenuId === doc.id ? null : doc.id)}
                        >
                          <MoreHorizontal size={18} />
                        </Button>

                        {openMenuId === doc.id && (
                          <div className="doc-action-menu-dropdown">
                            <div className="doc-action-menu-item" onClick={() => openEdit(doc)}>
                              <Edit size={14} /> Edit Details
                            </div>
                            <div className="doc-action-menu-item" onClick={() => openAssign(doc)}>
                              <UserPlus size={14} /> Assign
                            </div>
                            <div className="doc-action-menu-item danger" onClick={() => { handleDelete(doc.id); setOpenMenuId(null); }}>
                              <Trash2 size={14} /> Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )))}
            </tbody>
          </table>
        )}
      </Card>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Edit Metadata</h3>
              <button onClick={() => setIsEditModalOpen(false)}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label>Title</label>
              <input
                className="form-control"
                value={formData.title || ''}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label>Type</label>
                <select
                  className="form-select"
                  value={formData.type || 'Policy'}
                  onChange={e => setFormData({ ...formData, type: e.target.value })}
                >
                  <option value="Policy">Policy</option>
                  <option value="Procedure">Procedure</option>
                  <option value="Report">Report</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  className="form-select"
                  value={formData.status || 'Draft'}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Review Needed">Review Needed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Risk Level</label>
              <select
                className="form-select"
                value={formData.risk_level || 'Low'}
                onChange={e => setFormData({ ...formData, risk_level: e.target.value })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN MODAL */}
      {isAssignModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Assign Document</h3>
              <button onClick={() => setIsAssignModalOpen(false)}><X size={20} /></button>
            </div>

            <div className="form-group">
              <label>Owner (Employee)</label>
              <select
                className="form-select"
                value={formData.owner_id || ''}
                onChange={e => setFormData({ ...formData, owner_id: e.target.value })}
              >
                <option value="">-- Unassigned --</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.department})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Applicable Department (Target Audience)</label>
              <select
                className="form-select"
                value={formData.applicable_department || 'All'}
                onChange={e => setFormData({ ...formData, applicable_department: e.target.value })}
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Legal">Legal</option>
                <option value="Sales">Sales</option>
              </select>
              <p className="text-xs text-secondary mt-1">Determines who sees this in their compliance queue.</p>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="ghost" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
              <Button onClick={handleUpdate}>Assign</Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
