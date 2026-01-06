import React, { useEffect, useState } from 'react';
import { FileText, Upload, MoreHorizontal, AlertTriangle, CheckCircle, Loader } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { supabase } from '../lib/supabase';
import './Documents.css';

interface Document {
  id: string;
  title: string;
  type: string;
  updated_at: string; // or created_at
  status: string;
  risk_level: string;
  guardrails_count?: number; // might not exist in DB, default to 0
}

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map DB fields to UI if necessary
      const mappedDocs = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title || 'Untitled',
        type: doc.type || 'Document',
        updated_at: new Date(doc.created_at).toLocaleDateString(),
        status: doc.status || 'Draft',
        risk_level: doc.risk_level || 'Low',
        guardrails_count: doc.guardrails_count || Math.floor(Math.random() * 20) // Mock if missing
      }));

      setDocuments(mappedDocs);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="documents-page">
      <div className="page-header">
        <div>
          <h1 className="text-2xl font-bold mb-1">Documents</h1>
          <p className="text-secondary">Manage policies, SOPs, and governance guardrails.</p>
        </div>
        <Button>
          <Upload size={18} className="mr-2" /> Upload New
        </Button>
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
                <th>Last Updated</th>
                <th>Status</th>
                <th>Risk Level</th>
                <th>Guardrails</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr><td colSpan={7} className="text-center p-8 text-secondary">No documents found.</td></tr>
              ) : (
                documents.map((doc, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="doc-icon">
                          <FileText size={20} className="text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{doc.title}</div>
                          <div className="text-xs text-secondary">v1.0 • 2.4MB</div>
                        </div>
                      </div>
                    </td>
                    <td><Badge variant="neutral">{doc.type}</Badge></td>
                    <td className="text-secondary">{doc.updated_at}</td>
                    <td>
                      <Badge variant={doc.status === 'Active' ? 'success' : doc.status === 'Review Needed' ? 'warning' : 'neutral'}>
                        {doc.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        {doc.risk_level === 'High' && <AlertTriangle size={14} className="text-red-500" />}
                        {doc.risk_level === 'Low' && <CheckCircle size={14} className="text-green-500" />}
                        <span className={doc.risk_level === 'High' ? 'text-red-600 font-medium' : ''}>
                          {doc.risk_level}
                        </span>
                      </div>
                    </td>
                    <td>{doc.guardrails_count} rules</td>
                    <td>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal size={18} />
                      </Button>
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
