import React from 'react';
import { Play, Plus, GitBranch, Bell, CheckSquare, ShieldAlert, AlertOctagon } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import './Workflows.css';

export const Workflows: React.FC = () => {
    return (
        <div className="workflows-page">
            <div className="page-header mb-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Workflows Builder</h1>
                    <p className="text-secondary">Automate governance approvals and compliance checks.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Test Run</Button>
                    <Button>
                        <Play size={16} className="mr-2" /> Activate
                    </Button>
                </div>
            </div>

            <div className="workflow-canvas">
                {/* Trigger Node */}
                <div className="flow-node trigger" style={{ top: 50, left: 300 }}>
                    <div className="node-header">
                        <GitBranch size={16} /> TRIGGER
                    </div>
                    <div className="node-body">
                        New "High Risk" Policy Uploaded
                    </div>
                    <div className="connector-bottom"></div>
                </div>

                {/* Connection Line */}
                <div className="connection-line-vertical" style={{ top: 110, left: 400, height: 60 }}></div>

                {/* Condition Node */}
                <div className="flow-node condition" style={{ top: 170, left: 300 }}>
                    <div className="node-header">
                        <ShieldAlert size={16} /> GOVERNANCE CHECK
                    </div>
                    <div className="node-body">
                        Does policy contain "Biometric Data"?
                    </div>
                    <div className="connector-top"></div>
                    <div className="connector-bottom"></div>
                    <div className="connector-right"></div>
                </div>

                {/* Connection Line Yes */}
                <div className="connection-line-vertical" style={{ top: 230, left: 400, height: 60 }}></div>

                {/* Action Node */}
                <div className="flow-node action" style={{ top: 290, left: 300 }}>
                    <div className="node-header">
                        <Bell size={16} /> ACTION
                    </div>
                    <div className="node-body">
                        Notify Compliance Officer
                    </div>
                    <div className="connector-top"></div>
                    <div className="connector-bottom"></div>
                </div>

                {/* Connection Line */}
                <div className="connection-line-vertical" style={{ top: 350, left: 400, height: 60 }}></div>

                {/* Human Approval Node */}
                <div className="flow-node approval" style={{ top: 410, left: 300 }}>
                    <div className="node-header">
                        <CheckSquare size={16} /> HUMAN APPROVAL
                    </div>
                    <div className="node-body">
                        Requires VP Sign-off
                    </div>
                    <div className="connector-top"></div>
                </div>

                {/* Connection Line No */}
                <div className="connection-line-horizontal" style={{ top: 200, left: 500, width: 100 }}></div>

                {/* Red State Blocker */}
                <div className="flow-node blocker" style={{ top: 170, left: 600 }}>
                    <div className="node-header">
                        <AlertOctagon size={16} /> BLOCKER
                    </div>
                    <div className="node-body">
                        Auto-Reject Upload
                    </div>
                    <div className="connector-left"></div>
                </div>

            </div>
        </div>
    );
};
