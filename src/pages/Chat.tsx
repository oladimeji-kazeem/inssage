import React, { useState } from 'react';
import { Send, FileText, AlertTriangle, Lightbulb, Mic, MoreHorizontal } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import './Chat.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    badges?: { type: 'success' | 'warning' | 'error'; text: string }[];
    citations?: string[];
}

export const Chat: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I am Inssage Copilot. I can help you with HR policies, performance analysis, and compliance checks. How can I assist you today?',
        }
    ]);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Based on the 'Remote Work Policy v2.4', employees are allowed to work from abroad for up to 30 days per year, subject to manager approval and tax compliance checks.",
                badges: [{ type: 'success', text: 'Policy Compliant' }],
                citations: ['Remote Work Policy v2.4', 'Tax Compliance Handbook 2024']
            };
            setMessages(prev => [...prev, aiMsg]);
        }, 1000);
    };

    return (
        <div className="chat-layout">
            {/* Main Chat Area */}
            <div className="chat-main">
                <div className="chat-header">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">New Chat</h2>
                        <Button variant="ghost" size="sm"><MoreHorizontal size={20} /></Button>
                    </div>
                </div>

                <div className="chat-thread">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`message-row ${msg.role}`}>
                            <div className={`message-bubble ${msg.role}`}>
                                <div className="message-content">{msg.content}</div>

                                {msg.citations && (
                                    <div className="message-citations">
                                        <span className="text-xs font-bold uppercase text-secondary">Sources:</span>
                                        {msg.citations.map(c => (
                                            <Badge key={c} variant="neutral" className="cursor-pointer hover:bg-gray-200">
                                                <FileText size={10} className="mr-1" /> {c}
                                            </Badge>
                                        ))}
                                    </div>
                                )}

                                {msg.badges && (
                                    <div className="message-badges">
                                        {msg.badges.map((badge, idx) => (
                                            <Badge key={idx} variant={badge.type}>{badge.text}</Badge>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chat-input-area">
                    <form onSubmit={handleSend} className="chat-input-wrapper">
                        <input
                            className="chat-input-field"
                            placeholder="Ask about policies, people, or compliance..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        <div className="chat-input-actions">
                            <button
                                type="button"
                                className={`voice-btn ${isRecording ? 'recording' : ''}`}
                                onClick={() => setIsRecording(!isRecording)}
                            >
                                <Mic size={20} />
                            </button>
                            <Button type="submit" size="sm" disabled={!input}>
                                <Send size={18} />
                            </Button>
                        </div>
                    </form>
                    <p className="text-xs text-center text-secondary mt-2">
                        AI responses are generated based on your company's indexed documents.
                    </p>
                </div>
            </div>

            {/* Right Context Panel */}
            <div className="context-panel">
                <h3 className="text-sm font-bold uppercase text-secondary mb-4">Context & Governance</h3>

                <div className="context-section">
                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-2">
                        <FileText size={16} /> Relevant Documents
                    </h4>
                    <div className="context-list">
                        <div className="context-card">
                            <div className="font-medium text-sm">Remote Work Policy v2.4</div>
                            <Badge variant="success" className="mt-1">Active</Badge>
                        </div>
                        <div className="context-card">
                            <div className="font-medium text-sm">Tax Compliance Handbook</div>
                            <Badge variant="warning" className="mt-1">Review Needed</Badge>
                        </div>
                    </div>
                </div>

                <div className="context-section">
                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-2 text-amber-600">
                        <AlertTriangle size={16} /> Risk Analysis
                    </h4>
                    <Card className="bg-amber-50 border-amber-200 p-3">
                        <p className="text-xs text-amber-900">
                            <strong>Potential Compliance Issue:</strong> Working from prohibited countries (e.g., North Korea, Iran) is strictly forbidden.
                        </p>
                    </Card>
                </div>

                <div className="context-section">
                    <h4 className="flex items-center gap-2 text-sm font-semibold mb-2 text-primary">
                        <Lightbulb size={16} /> Suggested Workflows
                    </h4>
                    <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                        Trigger "Remote Work Approval"
                    </Button>
                </div>
            </div>

            {/* Floating Voice Mode Visualizer (Placeholder) */}
            {isRecording && (
                <div className="voice-overlay">
                    <div className="voice-wave">Listening...</div>
                </div>
            )}
        </div>
    );
};
