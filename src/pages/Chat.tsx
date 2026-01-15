import React, { useState, useRef } from 'react';
import { Send, FileText, AlertTriangle, Lightbulb, Mic, MoreHorizontal, Paperclip, X } from 'lucide-react';
import { searchService, type SearchResult } from '../services/searchService';
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
            content: 'Hello! I am Inssage Copilot. I can search our entire database of employees, documents, and risks for you. How can I help?',
        }
    ]);
    const [input, setInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [attachedFile, setAttachedFile] = useState<File | null>(null);
    const [contextItems, setContextItems] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() && !attachedFile) return;

        const userContent = attachedFile ? `${input} [Attached: ${attachedFile.name}]` : input;
        const userMsg: Message = { id: Date.now().toString(), role: 'user', content: userContent };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setAttachedFile(null);
        setLoading(true);

        try {
            // Call MCP Search Service
            const response = await searchService.processQuery(input);
            console.log('Search Results:', response);

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.content,
                citations: response.citations.map(c => c.title)
            };

            setMessages(prev => [...prev, aiMsg]);
            setContextItems(response.citations); // Update Sidebar

        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', content: "Sorry, I encountered an error searching the database." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAttachedFile(e.target.files[0]);
        }
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

                                {msg.citations && msg.citations.length > 0 && (
                                    <div className="message-citations">
                                        <span className="text-xs font-bold uppercase text-secondary">Sources:</span>
                                        {msg.citations.map((c, idx) => (
                                            <Badge key={idx} variant="neutral" className="cursor-pointer hover:bg-gray-200">
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
                    {loading && (
                        <div className="message-row assistant">
                            <div className="message-bubble assistant">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="chat-input-area">
                    <form onSubmit={handleSend} className="chat-input-wrapper">
                        <input
                            className="chat-input-field"
                            placeholder="Ask about policies, people, or compliance..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                        />
                        {attachedFile && (
                            <div className="absolute bottom-12 left-4 bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2 text-xs border border-gray-300">
                                <Paperclip size={12} />
                                {attachedFile.name}
                                <button onClick={() => setAttachedFile(null)}><X size={12} /></button>
                            </div>
                        )}
                        <div className="chat-input-actions">
                            <button
                                type="button"
                                className={`voice-btn ${isRecording ? 'recording' : ''}`}
                                onClick={() => setIsRecording(!isRecording)}
                            >
                                <Mic size={20} />
                            </button>

                            {/* File Attachment */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileSelect}
                            />
                            <button
                                type="button"
                                className="voice-btn"
                                onClick={() => fileInputRef.current?.click()}
                                title="Attach File"
                            >
                                <Paperclip size={20} />
                            </button>

                            <Button type="submit" size="sm" disabled={!input && !attachedFile}>
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
                        {contextItems.length === 0 ? (
                            <div className="text-sm text-gray-400 italic">Search results will appear here...</div>
                        ) : (
                            contextItems.map((item, i) => (
                                <div key={i} className="context-card">
                                    <div className="font-medium text-sm">{item.title}</div>
                                    <div className="text-xs text-secondary mt-1">{item.description}</div>
                                    <Badge variant="neutral" className="mt-1">{item.source}</Badge>
                                </div>
                            ))
                        )}
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
