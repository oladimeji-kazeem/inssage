import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Select } from '../components/ui/Select';
import { Shield, AlertTriangle, FileText, CheckCircle, Activity, Lock, TrendingUp, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, RadialBarChart, RadialBar, Legend, BarChart, Bar, PieChart, Pie } from 'recharts';
import './Analytics.css';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsCategory, AnalyticsTrend, AnalyticsComplex } from '../services/analyticsService';

export const ControlPlane = () => {
    const [activeTab, setActiveTab] = useState('risk');
    // const [loading, setLoading] = useState(true); // Removed unused loading state

    // Filters
    const [year, setYear] = useState('2024');
    const [department, setDepartment] = useState('all');

    // Data State
    const [data, setData] = useState<{
        riskHeatmap: any[];
        riskTrend: any[];
        auditFindings: any[];
        auditProgress: any[];
        complianceFrameworks: any[];
        complianceTrend: any[];
    }>({
        riskHeatmap: [],
        riskTrend: [],
        auditFindings: [],
        auditProgress: [],
        complianceFrameworks: [],
        complianceTrend: []
    });

    const tabs = [
        { id: 'risk', label: 'Risk Management' },
        { id: 'audit', label: 'Internal Audit' },
        { id: 'compliance', label: 'Regulatory Compliance' },
    ];

    useEffect(() => {
        const load = async () => {
            try {
                // Seed data first to ensure it exists
                await analyticsService.seedData();

                // Fetch Data
                // 1. Risk
                const riskHeatmap = await analyticsService.getComplexData('risk_heatmap');
                const riskTrend = await analyticsService.getTrends('risk_velocity');
                const riskCategories = await analyticsService.getCategories('risk_categories');
                const riskMitigation = await analyticsService.getCategories('risk_mitigation');

                // 2. Audit
                const auditFindings = await analyticsService.getCategories('audit_findings');
                const auditProgress = await analyticsService.getCategories('audit_progress');
                const auditTrend = await analyticsService.getTrends('audit_trend');
                const auditByDept = await analyticsService.getCategories('audit_by_department');

                // 3. Compliance
                const complianceFrameworks = await analyticsService.getCategories('compliance_frameworks');
                const complianceTrend = await analyticsService.getTrends('compliance_trend');
                const policyStatus = await analyticsService.getCategories('policy_status');
                const controlEffectiveness = await analyticsService.getComplexData('control_effectiveness');

                const fetchedData = {
                    riskHeatmap: riskHeatmap.map((d: any) => d),
                    riskTrend: riskTrend.map((d: any) => ({ ...d })),
                    riskCategories: riskCategories.map((d: any) => ({ name: d.label, value: d.value, color: d.color })),
                    riskMitigation: riskMitigation.map((d: any) => ({ name: d.label, value: d.value, color: d.color })),
                    auditFindings: auditFindings.map((d: any) => ({ name: d.label, value: d.value, color: d.color })),
                    auditProgress: auditProgress.map((d: any) => ({ name: d.label, completed: d.value, remaining: 100 - d.value })),
                    auditTrend: auditTrend.map((d: any) => ({ ...d })),
                    auditByDept: auditByDept.map((d: any) => ({ name: d.label, value: d.value, color: d.color })),
                    complianceFrameworks: complianceFrameworks.map((d: any) => ({ name: d.label, score: d.value, fill: d.color })),
                    complianceTrend: complianceTrend.map((d: any) => ({ ...d })),
                    policyStatus: policyStatus.map((d: any) => ({ name: d.label, value: d.value, color: d.color })),
                    controlEffectiveness: controlEffectiveness.map((d: any) => d)
                };
                setInitialData(fetchedData);
                setData(fetchedData); // Set initial data to display before filters are applied
            } catch (error) {
                console.error('Failed to load control plane data', error);
            }
        };

        load();
    }, []);

    // Apply Filters
    useEffect(() => {
        if (!initialData) return;

        let filtered = { ...initialData };

        const isHistorical = year === '2023';
        const d = department;
        const isDeptSelected = d !== 'all';

        // Helper: Simulate Department Slice (approx 20-30% of total)
        const sliceForDept = (items: any[]) => items.map((i: any) => ({
            ...i,
            value: i.value !== undefined ? Math.floor(i.value * (isDeptSelected ? 0.3 : 1)) : undefined,
            score: i.score !== undefined ? Math.floor(i.score * (isDeptSelected ? 0.95 : 1)) : undefined
        }));

        // Helper: Simulate Historical Data (approx 80% of current)
        const sliceForYear = (items: any[]) => items.map((i: any) => ({
            ...i,
            value: i.value !== undefined ? Math.floor(i.value * (isHistorical ? 0.85 : 1)) : undefined,
            score: i.score !== undefined ? Math.floor(i.score * (isHistorical ? 0.9 : 1)) : undefined
        }));

        // Chain filters
        const process = (items: any[]) => sliceForYear(sliceForDept(items));

        // 1. Risk Tab
        // Heatmap: Specific filter by 'dept' prop assigned in initialData
        if (isDeptSelected) {
            filtered.riskHeatmap = initialData.riskHeatmap.filter((item: any) => item.dept === d || item.category?.toLowerCase() === d);
        } else {
            filtered.riskHeatmap = initialData.riskHeatmap;
        }

        filtered.riskCategories = process(initialData.riskCategories);
        filtered.riskMitigation = process(initialData.riskMitigation);

        filtered.riskTrend = initialData.riskTrend.map((t: any) => ({
            ...t,
            value: Math.floor(t.value * (isHistorical ? 0.9 : 1) * (isDeptSelected ? 0.3 : 1))
        }));

        // 2. Audit Tab
        filtered.auditFindings = process(initialData.auditFindings);
        filtered.auditProgress = initialData.auditProgress.map((d: any) => {
            const processedValue = Math.floor(d.value * (isHistorical ? 0.85 : 1) * (isDeptSelected ? 0.3 : 1));
            return { ...d, completed: processedValue, remaining: 100 - processedValue };
        });

        filtered.auditTrend = initialData.auditTrend.map((t: any) => ({
            ...t,
            value: Math.floor(t.value * (isHistorical ? 1.1 : 1) * (isDeptSelected ? 0.25 : 1)), // More findings last year?
            extra_value: Math.floor(t.extra_value * (isHistorical ? 0.9 : 1) * (isDeptSelected ? 0.25 : 1))
        }));

        // Audit By Dept: Filter specifically or show all if 'all'
        if (isDeptSelected) {
            filtered.auditByDept = initialData.auditByDept.filter((item: any) => item.name.toLowerCase().includes(d));
        } else {
            filtered.auditByDept = process(initialData.auditByDept); // Just year affect
        }

        // 3. Compliance Tab
        filtered.complianceFrameworks = process(initialData.complianceFrameworks);
        filtered.policyStatus = process(initialData.policyStatus);

        filtered.controlEffectiveness = initialData.controlEffectiveness.map((i: any) => ({
            ...i,
            Design: Math.floor(i.Design * (isHistorical ? 0.95 : 1)),
            Operating: Math.floor(i.Operating * (isHistorical ? 0.88 : 1)) // Lower operating effectiveness in past
        }));

        filtered.complianceTrend = initialData.complianceTrend.map((t: any) => ({
            ...t,
            value: Math.min(100, Math.floor(t.value * (isHistorical ? 0.92 : 1)))
        }));

        setData(filtered);
    }, [initialData, year, department]);

    // Filter Logic (Mock implementation for UI demo)
    // const filteredRisks = data.riskHeatmap; 

    return (
        <div className="analytics-container">
            <div className="analytics-header">
                <div>
                    <h1 className="page-title">Control Plane</h1>
                    <p className="page-subtitle">Manage Risks, Audits, and Compliance Standards</p>
                </div>
                <div className="header-actions">
                    <button className="btn-primary">
                        <Shield className="btn-icon" size={18} />
                        New Assessment
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="analytics-filters">
                <Select
                    label="Year"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    options={[
                        { value: '2024', label: '2024' },
                        { value: '2023', label: '2023' },
                    ]}
                />
                <Select
                    label="Department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    options={[
                        { value: 'all', label: 'All Departments' },
                        { value: 'finance', label: 'Finance' },
                        { value: 'it', label: 'IT & Security' },
                        { value: 'hr', label: 'Human Resources' },
                        { value: 'ops', label: 'Operations' },
                    ]}
                />
            </div>

            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="analytics-content">
                {activeTab === 'risk' && (
                    <>
                        <div className="metrics-grid">
                            <Card>
                                <div className="metric-header">
                                    <span className="metric-title">Critical Risks</span>
                                    <AlertTriangle size={16} className="metric-icon negative" />
                                </div>
                                <div className="metric-value">12</div>
                                <div className="metric-trend negative">
                                    <span>+3 vs last quarter</span>
                                </div>
                            </Card>
                            <Card>
                                <div className="metric-header">
                                    <span className="metric-title">Mitigation Progress</span>
                                    <Activity size={16} className="metric-icon" />
                                </div>
                                <div className="metric-value">68%</div>
                                <div className="metric-trend positive">
                                    <span>On track</span>
                                </div>
                            </Card>
                            <Card>
                                <div className="metric-header">
                                    <span className="metric-title">Risk Velocity</span>
                                    <TrendingUp size={16} className="metric-icon" />
                                </div>
                                <div className="metric-value">Medium</div>
                                <div className="metric-trend">
                                    <span>Stable trend</span>
                                </div>
                            </Card>
                        </div>

                        <div className="charts-grid two-columns">
                            <Card className="chart-card">
                                <h3 className="chart-title">Risk Heatmap (Impact vs Likelihood)</h3>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid />
                                            <XAxis type="number" dataKey="likelihood" name="Likelihood" unit="" domain={[0, 6]} label={{ value: 'Likelihood', position: 'insideBottom', offset: -10 }} />
                                            <YAxis type="number" dataKey="impact" name="Impact" unit="" domain={[0, 6]} label={{ value: 'Impact', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
                                                            <p className="label"><strong>{data.name}</strong></p>
                                                            <p>Category: {data.category}</p>
                                                            <p>Owner: {data.owner}</p>
                                                            <p>Likelihood: {data.likelihood}, Impact: {data.impact}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }} />
                                            <Scatter name="Risks" data={data.riskHeatmap} fill="#ef4444">
                                                {data.riskHeatmap.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.impact * entry.likelihood > 15 ? '#ef4444' : entry.impact * entry.likelihood > 8 ? '#f59e0b' : '#3b82f6'} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-card">
                                <h3 className="chart-title">Risk Velocity Trend</h3>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={data.riskTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHris)" />
                                            <defs>
                                                <linearGradient id="colorHris" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === 'audit' && (
                    <>
                        <div className="metrics-grid">
                            <Card>
                                <div className="metric-header">
                                    <span className="metric-title">Open Findings</span>
                                    <AlertCircle size={16} className="metric-icon warning" />
                                </div>
                                <div className="metric-value">24</div>
                                <div className="metric-trend negative">
                                    <span>8 High Priority</span>
                                </div>
                            </Card>
                            <Card>
                                <div className="metric-header">
                                    <span className="metric-title">Planned Audits</span>
                                    <Activity size={16} className="metric-icon" />
                                </div>
                                <div className="metric-value">4</div>
                                <div className="metric-trend">
                                    <span>Q2 2024</span>
                                </div>
                            </Card>
                            <Card>
                                <div className="metric-header">
                                    <span className="metric-title">Remediation Rate</span>
                                    <CheckCircle size={16} className="metric-icon positive" />
                                </div>
                                <div className="metric-value">92%</div>
                                <div className="metric-trend positive">
                                    <span>+5% vs target</span>
                                </div>
                            </Card>
                        </div>
                        <div className="charts-grid two-columns">
                            <Card className="chart-card">
                                <h3 className="chart-title">Findings by Severity</h3>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={data.auditFindings}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {data.auditFindings.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-card">
                                <h3 className="chart-title">Audit Plan Progress</h3>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={data.auditProgress} layout="vertical" margin={{ left: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis dataKey="name" type="category" width={80} />
                                            <Tooltip />
                                            <Bar dataKey="completed" name="Completed %" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </>
                )}

                {activeTab === 'compliance' && (
                    <>
                        <div className="metrics-grid">
                            <Card>
                                <div className="metric-header">
                                    <span className="metric-title">Compliance Score</span>
                                    <Shield size={16} className="metric-icon positive" />
                                </div>
                                <div className="metric-value">94%</div>
                                <div className="metric-trend positive">
                                    <span>SOC2 / ISO 27001</span>
                                </div>
                            </Card>
                            <Card>
                                <div className="metric-header">
                                    <span className="metric-title">Open Gaps</span>
                                    <AlertTriangle size={16} className="metric-icon warning" />
                                </div>
                                <div className="metric-value">7</div>
                                <div className="metric-trend">
                                    <span>Requires attention</span>
                                </div>
                            </Card>
                            <Card>
                                <div className="metric-header">
                                    <span className="metric-title">Policy Coverage</span>
                                    <Lock size={16} className="metric-icon" />
                                </div>
                                <div className="metric-value">100%</div>
                                <div className="metric-trend positive">
                                    <span>All employees trained</span>
                                </div>
                            </Card>
                        </div>
                        <div className="charts-grid two-columns">
                            <Card className="chart-card">
                                <h3 className="chart-title">Compliance Framework Status</h3>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" barSize={20} data={data.complianceFrameworks}>
                                            <RadialBar
                                                label={{ position: 'insideStart', fill: '#fff' }}
                                                background
                                                dataKey="score"
                                            />
                                            <Legend iconSize={10} layout="vertical" verticalAlign="middle" wrapperStyle={{ top: '50%', right: 0, transform: 'translate(0, -50%)', lineHeight: '24px' }} />
                                            <Tooltip />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-card">
                                <h3 className="chart-title">Compliance Score Trend</h3>
                                <div className="chart-container">
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={data.complianceTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="period" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="#8b5cf6" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
