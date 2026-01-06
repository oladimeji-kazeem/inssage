import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Plus, RefreshCw, Loader } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import './Integrations.css';

interface Integration {
    id: string;
    name: string;
    status: string;
    last_sync: string;
    category: string;
}

export const Integrations: React.FC = () => {
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchIntegrations = async () => {
            const { data } = await supabase.from('integrations').select('*');
            if (data) {
                setIntegrations(data.map(i => ({
                    ...i,
                    category: i.category || 'Tool' // Mock fallback
                })));
            }
            setLoading(false);
        };
        fetchIntegrations();
    }, []);

    return (
        <div className="integrations-page">
            <div className="page-header mb-8">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Integrations Hub</h1>
                    <p className="text-secondary">Connect your data sources via MCP (Model Context Protocol).</p>
                </div>
                <Button>
                    <Plus size={18} className="mr-2" /> Add Integration
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center p-12 text-secondary">
                    <Loader className="animate-spin mr-2" /> Check connectors...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {integrations.map((item, idx) => (
                        <Card key={idx} className="integration-card flex flex-col items-center text-center p-6">
                            <div className={`integration-icon ${item.name.toLowerCase().replace(/\s/g, '')}-icon`}>
                                {item.name.substring(0, 2).toUpperCase()}
                            </div>
                            <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                            <div className="text-xs text-secondary mb-4">{item.category}</div>

                            <div className="flex items-center gap-2 mb-4">
                                {item.status === 'Connected' && <CheckCircle size={14} className="text-green-500" />}
                                {item.status === 'Failed' && <AlertCircle size={14} className="text-red-500" />}
                                <span className={`text-sm font-medium ${item.status === 'Connected' ? 'text-green-700' :
                                    item.status === 'Failed' ? 'text-red-700' : 'text-gray-500'
                                    }`}>{item.status}</span>
                            </div>

                            {item.status === 'Connected' && (
                                <div className="text-xs text-secondary w-full border-t pt-3 flex justify-between items-center">
                                    <span>Synced: {new Date(item.last_sync).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    <RefreshCw size={12} className="cursor-pointer hover:text-primary" />
                                </div>
                            )}
                            {item.status !== 'Connected' && (
                                <Button variant="outline" size="sm" className="w-full mt-auto">Connect</Button>
                            )}
                        </Card>
                    ))}
                    {integrations.length === 0 && (
                        <p className="text-secondary col-span-4 text-center">No integrations found.</p>
                    )}
                </div>
            )}
        </div>
    );
};
