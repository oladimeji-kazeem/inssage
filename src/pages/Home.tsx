import React from 'react';
import { MessageSquare, BarChart2, FileText, GitBranch, ArrowRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import './Home.css';

export const Home: React.FC = () => {
    const quickActions = [
        {
            icon: MessageSquare,
            title: "Ask something based on your data",
            desc: "Query policies, contracts, and employee records securely.",
            action: "Start Chat"
        },
        {
            icon: BarChart2,
            title: "Analyze employee performance",
            desc: "Get AI-driven insights on team productivity and attrition risk.",
            action: "View Analytics"
        },
        {
            icon: FileText,
            title: "Review an HR policy",
            desc: "Check compliance against local labor laws and internal rules.",
            action: "Browse Documents"
        },
        {
            icon: GitBranch,
            title: "Create a workflow",
            desc: "Automate approval chains for new hires and compliance checks.",
            action: "Build Workflow"
        }
    ];

    return (
        <div className="home-container">
            <div className="welcome-banner">
                <h1 className="welcome-title">Every AI Action. Accountable.</h1>
                <p className="welcome-subtitle">
                    Your enterprise governance copilot — powered by your policies, your systems, and your guardrails.
                </p>
            </div>

            <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                    <Card key={index} className="action-card" hoverable>
                        <div className="action-icon-wrapper">
                            <action.icon size={24} className="text-primary" />
                        </div>
                        <h3 className="action-title">{action.title}</h3>
                        <p className="action-desc">{action.desc}</p>
                        <div className="action-link">
                            <span>{action.action}</span>
                            <ArrowRight size={16} />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
