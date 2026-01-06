import React, { useEffect, useState } from 'react';
import { Search, Bookmark, Loader } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import './Prompts.css';

interface Prompt {
    id: string;
    title: string;
    category: string;
    tags: string[];
    description: string;
    content: string;
}

export const Prompts: React.FC = () => {
    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrompts = async () => {
            const { data } = await supabase.from('prompts').select('*');
            if (data) {
                setPrompts(data.map(p => ({
                    ...p,
                    tags: p.tags || [] // Ensure tags is array
                })));
            }
            setLoading(false);
        };
        fetchPrompts();
    }, []);

    return (
        <div className="prompts-page">
            <div className="page-header mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Prompt Library</h1>
                    <p className="text-secondary">Curated, role-based prompts for your team.</p>
                </div>
                <div className="flex gap-2">
                    <div className="search-bar" style={{ width: 300 }}>
                        <Search className="search-icon" size={16} />
                        <input placeholder="Search prompts..." className="search-input" />
                    </div>
                    <Button>Add Prompt</Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12 text-secondary">
                    <Loader className="animate-spin mr-2" /> Loading library...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {prompts.map((prompt, idx) => (
                        <Card key={idx} hoverable className="prompt-card flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                                <Badge variant={prompt.category === 'Compliance' ? 'warning' : 'neutral'}>{prompt.category}</Badge>
                                <Button variant="ghost" size="sm"><Bookmark size={16} /></Button>
                            </div>
                            <h3 className="text-lg font-bold mb-2">{prompt.title}</h3>
                            <p className="text-sm text-secondary mb-4 flex-1">{prompt.description}</p>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {prompt.tags.map(tag => <Badge key={tag} variant="neutral" className="text-xs">#{tag}</Badge>)}
                            </div>

                            <Button variant="outline" size="sm" className="w-full">
                                Use Prompt
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
