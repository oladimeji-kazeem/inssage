import React, { useState } from 'react';
import {
    Search, Bookmark, Copy, Play, Zap, FileText,
    Shield, Code, PenTool, MessageSquare, Briefcase, Plus, Users, LayoutGrid
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import './Prompts.css';

interface Prompt {
    id: string;
    title: string;
    category: 'Legal' | 'Compliance' | 'Engineering' | 'Creative' | 'HR' | 'Sales';
    tags: string[];
    description: string;
    content: string;
    author: string;
    usageCount: number;
}

export const Prompts: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Mock Data for Premium UI
    const prompts: Prompt[] = [
        // Legal
        { id: '1', title: 'Contract Review AI', category: 'Legal', tags: ['Contracts', 'Review'], description: 'Analyze contracts for potential risks, missing clauses, and non-standard terms.', content: 'Review the following contract for... ', author: 'Legal Team', usageCount: 1240 },
        { id: '2', title: 'NDA Generator', category: 'Legal', tags: ['NDA', 'Drafting'], description: 'Draft a standard Non-Disclosure Agreement for new partners.', content: 'Generate an NDA for... ', author: 'Legal Operations', usageCount: 850 },
        { id: '101', title: 'IP Clause Validator', category: 'Legal', tags: ['IP', 'Validation'], description: 'Checks intellectual property clauses against company playbook standards.', content: 'Validate IP clause...', author: 'Legal Tech', usageCount: 320 },

        // Compliance
        { id: '3', title: 'GDPR Compliance Check', category: 'Compliance', tags: ['GDPR', 'Privacy'], description: 'Verify if a data handling process meets GDPR standards.', content: 'Check if this process complies with GDPR...', author: 'Compliance Officer', usageCount: 2100 },
        { id: '4', title: 'Risk Assessment Framework', category: 'Compliance', tags: ['Risk', 'Framework'], description: 'Generate a risk assessment matrix for a new project based on ISO 27001.', content: 'Create a risk matrix for...', author: 'Risk Management', usageCount: 560 },

        // Engineering
        { id: '5', title: 'Code Refactor Expert', category: 'Engineering', tags: ['Code', 'Refactor'], description: 'Suggest improvements for code readability and performance.', content: 'Refactor this code to improve...', author: 'Senior Dev', usageCount: 3400 },
        { id: '6', title: 'API Docs Generator', category: 'Engineering', tags: ['API', 'Docs'], description: 'Generate standard Open API documentation from code snippets.', content: 'Document this API endpoint...', author: 'Tech Lead', usageCount: 1800 },
        { id: '501', title: 'SQL Query Optimizer', category: 'Engineering', tags: ['Database', 'SQL'], description: 'Analyze and optimize complex SQL queries for performance.', content: 'Optimize this SQL...', author: 'DBA', usageCount: 1200 },

        // Creative
        { id: '7', title: 'Marketing Copy Generator', category: 'Creative', tags: ['Marketing', 'Copy'], description: 'Create engaging social media posts for product launches and campaigns.', content: 'Write a LinkedIn post about...', author: 'Marketing', usageCount: 5200 },
        { id: '8', title: 'Blog Post Outliner', category: 'Creative', tags: ['Content', 'Blog'], description: 'Create a structured outline for a technical blog post.', content: 'Outline a blog post about...', author: 'Content Team', usageCount: 1500 },

        // HR
        { id: '9', title: 'Job Description Builder', category: 'HR', tags: ['Hiring', 'JD'], description: 'Create inclusive and effective job descriptions for new roles.', content: 'Write a JD for...', author: 'Recruiting', usageCount: 900 },
        { id: '10', title: 'Interview Question Bank', category: 'HR', tags: ['Interview', 'Soft Skills'], description: 'Generate behavioral interview questions based on role requirements.', content: 'Generate interview questions...', author: 'People Ops', usageCount: 1100 },

        // Sales
        { id: '11', title: 'Cold Outreach Email', category: 'Sales', tags: ['Email', 'Outreach'], description: 'Draft personalized cold emails to prospects.', content: 'Draft a cold email...', author: 'Sales Lead', usageCount: 3000 },
    ];

    const categories = ['All', 'Legal', 'Compliance', 'Engineering', 'Creative', 'HR', 'Sales'];

    const getIcon = (category: string) => {
        const size = 18;
        switch (category) {
            case 'Legal': return <Shield size={size} />;
            case 'Compliance': return <FileText size={size} />;
            case 'Engineering': return <Code size={size} />;
            case 'Creative': return <PenTool size={size} />;
            case 'HR': return <Users size={size} />;
            case 'Sales': return <Briefcase size={size} />;
            default: return <MessageSquare size={size} />;
        }
    };

    const getCategoryClass = (category: string) => {
        return `cat-${category.toLowerCase()}`;
    };

    const getBorderClass = (category: string) => {
        return `border-${category.toLowerCase()}`;
    };

    const filteredPrompts = prompts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="prompts-page">
            <div className="max-w-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="premium-title">Prompt Library</h1>
                        <p className="premium-subtitle">Discover and share standardized prompts to accelerate your workflow.</p>
                    </div>
                    <button className="btn-primary">
                        <Plus size={20} /> Create New Prompt
                    </button>
                </div>

                {/* Toolbar */}
                <div className="toolbar-container">
                    {/* Search */}
                    <div className="search-wrapper">
                        <Search className="search-icon-absolute" size={20} />
                        <input
                            type="text"
                            placeholder="Search by title, tag, or description..."
                            className="search-input"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Categories */}
                    <div className="filter-scroll-container">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Masonry Grid */}
                <div className="prompts-masonry-grid">
                    {filteredPrompts.map(prompt => (
                        <div key={prompt.id} className="prompt-card-wrapper">
                            <div className={`prompt-card card-border-accent ${getBorderClass(prompt.category)}`}>
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`category-badge ${getCategoryClass(prompt.category)}`}>
                                        {getIcon(prompt.category)}
                                        {prompt.category}
                                    </div>
                                    <button style={{ color: '#9ca3af', border: 'none', background: 'none', cursor: 'pointer' }}>
                                        <Bookmark size={18} />
                                    </button>
                                </div>

                                /* Content */
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{prompt.title}</h3>
                                    <p className="text-gray-500" style={{ fontSize: '14px', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {prompt.description}
                                    </p>
                                </div>

                                /* Tags */
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    {prompt.tags.map(tag => (
                                        <span key={tag} className="tag">
                                            {tag}
                                        </span>
                                    ))}
                                    <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Zap size={14} fill="#facc15" color="#facc15" /> {prompt.usageCount}
                                    </span>
                                </div>

                                /* Action */
                                <button className="btn-card-action">
                                    <Play size={16} /> Use Prompt
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredPrompts.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <div style={{ width: '80px', height: '80px', background: '#f3f4f6', borderRadius: '50%', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Search size={32} color="#9ca3af" />
                        </div>
                        <h3 className="text-lg font-bold">No prompts found</h3>
                        <p style={{ color: '#6b7280', marginTop: '8px' }}>Try adjusting your search terms or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
