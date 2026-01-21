import React from 'react';
import { Pause, StopCircle, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import './MeetingCopilot.css';

export const MeetingCopilot: React.FC = () => {
    return (
        <div className="meeting-page">
            <div className="meeting-header">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                        Weekly Compliance Sync
                    </h1>
                    <p className="text-secondary">Attendees: Alex, Sarah, Mike + Inssage Copilot</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline"><Pause size={18} className="mr-2" /> Pause</Button>
                    <Button variant="danger"><StopCircle size={18} className="mr-2" /> End Meeting</Button>
                </div>
            </div>

            <div className="meeting-grid">
                {/* Live Transcript */}
                <Card className="transcript-panel">
                    <h3 className="section-title">Live Transcript</h3>
                    <div className="transcript-stream">
                        <div className="transcript-item">
                            <div className="speaker">Alex (HR)</div>
                            <p>We need to discuss the new remote work policy updates for employees in California.</p>
                        </div>
                        <div className="transcript-item">
                            <div className="speaker">Sarah (Legal)</div>
                            <p>Right. The new labor laws require us to update section 4.2 regarding expense reimbursement.</p>
                        </div>
                        <div className="transcript-item highlight">
                            <div className="speaker">Inssage Copilot</div>
                            <p>Flag: California Labor Code Section 2802 mandates 100% reimbursement for necessary business expenses. Policy v2.3 currently caps this at $50/mo.</p>
                            <Badge variant="error" className="mt-1">Compliance Risk</Badge>
                        </div>
                        <div className="transcript-item">
                            <div className="speaker">Alex (HR)</div>
                            <p>Thanks Copilot. Let's flag that for revision.</p>
                        </div>
                        <div className="transcript-item typing">
                            <div className="speaker">Mike (Finance)</div>
                            <p>...</p>
                        </div>
                    </div>
                </Card>

                {/* Right Sidebar: Summaries & Actions */}
                <div className="meeting-sidebar">
                    <Card className="sidebar-section">
                        <h3 className="section-title">Action Items</h3>
                        <ul className="action-list">
                            <li>
                                <input type="checkbox" />
                                <span>Update Sec 4.2 for CA employees</span>
                            </li>
                            <li>
                                <input type="checkbox" />
                                <span>Review budget impact with Finance</span>
                            </li>
                        </ul>
                        <Button variant="ghost" size="sm" className="mt-2 text-primary">+ Add Item</Button>
                    </Card>

                    <Card className="sidebar-section">
                        <h3 className="section-title">Live Data Surfaced</h3>
                        <div className="data-card">
                            <div className="data-title">CA Labor Code 2802</div>
                            <div className="data-snippet">"An employer shall indemnify his or her employee for all necessary expenditures..."</div>
                            <Button variant="outline" size="sm" className="w-full mt-2">View Full Text</Button>
                        </div>
                    </Card>

                    <Button variant="secondary" className="w-full mt-auto">
                        <Download size={16} className="mr-2" /> Export Summary
                    </Button>
                </div>
            </div>
        </div>
    );
};
