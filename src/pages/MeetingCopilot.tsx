import React, { useEffect, useState } from 'react';
import {
    Calendar, Clock, Users, Plus, Trash2, List
} from 'lucide-react'; // Safe imports
import { meetingService, Meeting } from '../services/meetingService';
import './Governance.css';

export const MeetingCopilot: React.FC = () => {
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadMeetings();
    }, []);

    const loadMeetings = async () => {
        try {
            // Safe fetch with fallback inside service, but double safe here
            const data = await meetingService.getMeetings();
            setMeetings(data || []);
        } catch (e) {
            console.error('Failed to load meetings in component', e);
            // Don't crash, just show empty
            setMeetings([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this meeting?')) {
            setMeetings(prev => prev.filter(m => m.id !== id));
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Live': return '#ef4444';
            case 'Scheduled': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    const isLive = (status: string) => status === 'Live';

    if (isLoading) {
        return <div style={{ padding: 40, textAlign: 'center', color: '#6b7280' }}>Loading meetings...</div>;
    }

    return (
        <div className="gov-page">
            <div className="max-w-container">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0 }}>Meetings & Transcripts</h1>
                        <p style={{ fontSize: '16px', color: '#6b7280', marginTop: '8px' }}>Manage your governance sessions and review automated summaries.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {/* View Toggle */}
                        <div style={{ background: '#f3f4f6', padding: '4px', borderRadius: '8px', display: 'flex' }}>
                            <button
                                onClick={() => setViewMode('list')}
                                style={{
                                    padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                                    background: viewMode === 'list' ? 'white' : 'transparent',
                                    color: viewMode === 'list' ? '#111827' : '#6b7280',
                                    boxShadow: viewMode === 'list' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                <List size={14} style={{ marginRight: 6 }} /> List
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                style={{
                                    padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                                    background: viewMode === 'calendar' ? 'white' : 'transparent',
                                    color: viewMode === 'calendar' ? '#111827' : '#6b7280',
                                    boxShadow: viewMode === 'calendar' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                                }}
                            >
                                <Calendar size={14} style={{ marginRight: 6 }} /> Calendar
                            </button>
                        </div>

                        <button style={{
                            backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '8px',
                            fontWeight: '600', border: 'none', display: 'flex', alignItems: 'center', gap: '8px',
                            cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                        }}>
                            <Plus size={18} /> New Meeting
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                    {meetings.length > 0 ? (
                        meetings.map(meeting => (
                            <div key={meeting.id} style={{
                                background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '24px',
                                display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{
                                        fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
                                        color: getStatusColor(meeting.status), display: 'flex', alignItems: 'center', gap: '6px'
                                    }}>
                                        {isLive(meeting.status) && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }}></div>}
                                        {meeting.status.toUpperCase()}
                                    </div>
                                    <button
                                        onClick={() => handleDelete(meeting.id)}
                                        style={{ color: '#d1d5db', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '8px', lineHeight: '1.3' }}>
                                        {meeting.title}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6b7280', fontSize: '13px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Calendar size={14} />
                                            {new Date(meeting.date).toLocaleDateString()}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <Clock size={14} />
                                            {new Date(meeting.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#6b7280', fontSize: '13px' }}>
                                    <Users size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                                    <span style={{ lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {meeting.attendees?.join(', ') || 'No attendees'}
                                    </span>
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '8px' }}>
                                    <button style={{
                                        width: 'fit-content', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
                                        fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
                                        background: isLive(meeting.status) || meeting.status === 'Scheduled' ? 'white' : 'white',
                                        border: isLive(meeting.status) || meeting.status === 'Scheduled' ? '1px solid #d1d5db' : '1px solid #e5e7eb',
                                        color: '#374151',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}>
                                        {isLive(meeting.status) || meeting.status === 'Scheduled' ? 'Join Session' : 'View Summary'}
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: '#9ca3af', fontStyle: 'italic' }}>
                            No meetings found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
