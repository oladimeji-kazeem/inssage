import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Select } from '../components/ui/Select';
import { Shield, AlertTriangle, CheckCircle, Activity, Lock, TrendingUp, AlertCircle, Database, UserCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell, RadialBarChart, RadialBar, Legend, BarChart, Bar, PieChart, Pie } from 'recharts';
import './Analytics.css';
import { analyticsService } from '../services/analyticsService';
import { seedDatabase } from '../utils/seeder';

export const ControlPlane = () => {
    const [activeTab, setActiveTab] = useState<'risk' | 'audit' | 'compliance' | 'people'>('risk');
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
        riskCategories: any[];
        riskMitigation: any[];

        riskKpis: any[];
        auditKpis: any[];
        complianceKpis: any[];
        riskByDept: any[];
        auditTrend: any[];
        auditByDept: any[];
        policyStatus: any[];
        controlEffectiveness: any[];
    }>({
        riskHeatmap: [],
        riskTrend: [],
        auditFindings: [],
        auditProgress: [],
        complianceFrameworks: [],
        complianceTrend: [],
        riskCategories: [],
        riskMitigation: [],

        riskKpis: [],
        auditKpis: [],
        complianceKpis: [],
        riskByDept: [],
        auditTrend: [],
        auditByDept: [],
        policyStatus: [],
        controlEffectiveness: []
    });

    const [initialData, setInitialData] = useState<any>(null);

    // New State for Tables
    const [riskTable, setRiskTable] = useState<any[]>([]);
    const [auditTable, setAuditTable] = useState<any[]>([]);
    const [policyTable, setPolicyTable] = useState<any[]>([]);

    const [employeeTable, setEmployeeTable] = useState<any[]>([]);
    const [initialEmployees, setInitialEmployees] = useState<any[]>([]); // New: Store original list for filtering
    const [peopleMetrics, setPeopleMetrics] = useState({
        highRiskEmployees: 0,
        trainingCompletion: 0,
        pendingAttestations: 0,
        avgSecurityScore: 0
    });
    const [loading, setLoading] = useState(true);


    const tabs = [
        { id: 'risk', label: 'Risk Management' },
        { id: 'audit', label: 'Internal Audit' },
        { id: 'compliance', label: 'Regulatory Compliance' },
        { id: 'people', label: 'People Assurance' }, // New Tab
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
                const riskKpis = await analyticsService.getKPIs('risk_management');

                // 2. Audit
                const auditFindings = await analyticsService.getCategories('audit_findings');
                const auditProgress = await analyticsService.getCategories('audit_progress');
                const auditTrend = await analyticsService.getTrends('audit_trend');
                const auditByDept = await analyticsService.getCategories('audit_by_department');
                const auditKpis = await analyticsService.getKPIs('audit');

                // 3. Compliance
                const complianceFrameworks = await analyticsService.getCategories('compliance_frameworks');
                const complianceTrend = await analyticsService.getTrends('compliance_trend');
                const policyStatus = await analyticsService.getCategories('policy_status');
                const complianceKpis = await analyticsService.getKPIs('compliance');
                const controlEffectiveness = await analyticsService.getComplexData('control_effectiveness');

                const fetchedData = {
                    riskHeatmap: riskHeatmap.map((d: any) => d),
                    riskTrend: riskTrend.map((d: any) => ({ ...d })),
                    riskCategories: riskCategories.map((d: any) => ({ name: d.label, value: d.value, color: d.color })),
                    riskMitigation: riskMitigation.map((d: any) => ({ name: d.label, value: d.value, color: d.color })),

                    riskKpis: riskKpis.map((d: any) => d),
                    auditFindings: auditFindings.map((d: any) => ({ name: d.label, value: d.value, color: d.color })),

                    auditProgress: auditProgress.map((d: any) => ({ name: d.label, completed: d.value, remaining: 100 - d.value })),
                    auditTrend: auditTrend.map((d: any) => ({ ...d })),
                    auditByDept: auditByDept.map((d: any) => ({ name: d.label, value: d.value, color: d.color })),
                    auditKpis: auditKpis.map((d: any) => d),
                    complianceFrameworks: complianceFrameworks.map((d: any) => ({ name: d.label, score: d.value, fill: d.color })),
                    complianceTrend: complianceTrend.map((d: any) => ({ ...d })),
                    policyStatus: policyStatus.map((d: any) => ({ name: d.label, value: d.value, color: d.color })),
                    complianceKpis: complianceKpis.map((d: any) => d),
                    controlEffectiveness: controlEffectiveness.map((d: any) => d),
                    riskByDept: []
                };
                setInitialData(fetchedData);
                setData(fetchedData);

                // Set Table Data
                // Seed GRC Data (Including Employees and Documents)
                await analyticsService.seedGRCData();
                await analyticsService.seedDocumentsData(); // Ensure documents/employees seeded

                // Fetch GRC Data
                const risks = await analyticsService.getGRCData('risks');
                // const audits = await analyticsService.getGRCData('internal_audits'); // Removed unused
                const findings = await analyticsService.getGRCData('audit_findings');
                const policies = await analyticsService.getGRCData('compliance_policies');

                // Fetch Employees & Metrics
                const employees = await analyticsService.getEmployeesData();
                // pMetrics are calculated on the fly now

                setRiskTable(risks);
                setAuditTable(findings);
                setPolicyTable(policies);
                setInitialEmployees(employees); // Store raw data
                setEmployeeTable(employees); // Initial render

                setLoading(false);
            } catch (error) {
                console.error('Failed to load control plane data', error);
                setLoading(false);
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
            value: Math.floor(t.value * (isHistorical ? 1.1 : 1) * (isDeptSelected ? 0.25 : 1)),
            extra_value: Math.floor(t.extra_value * (isHistorical ? 0.9 : 1) * (isDeptSelected ? 0.25 : 1))
        }));

        // Audit By Dept: Filter specifically or show all if 'all'
        if (isDeptSelected) {
            filtered.auditByDept = initialData.auditByDept.filter((item: any) => item.name.toLowerCase().includes(d));
        } else {
            filtered.auditByDept = process(initialData.auditByDept);
        }

        // 3. Compliance Tab
        filtered.complianceFrameworks = process(initialData.complianceFrameworks);
        filtered.policyStatus = process(initialData.policyStatus);

        filtered.controlEffectiveness = initialData.controlEffectiveness.map((i: any) => ({
            ...i,
            Design: Math.floor(i.Design * (isHistorical ? 0.95 : 1)),
            Operating: Math.floor(i.Operating * (isHistorical ? 0.88 : 1))
        }));

        filtered.complianceTrend = initialData.complianceTrend.map((t: any) => ({
            ...t,
            value: Math.min(100, Math.floor(t.value * (isHistorical ? 0.92 : 1)))
        }));

        // 4. People Tab Filtering
        let filteredEmployees = [...initialEmployees];

        if (isDeptSelected) {
            // Check against department prop and map common abbreviations
            const deptMap: Record<string, string> = {
                'it': 'Engineering', // Map 'it' filter to 'Engineering' data
                'finance': 'Finance',
                'hr': 'HR',
                'ops': 'Operations',
                'sales': 'Sales'
            };
            const targetDept = deptMap[d] || d; // Use mapped name or raw filter value

            filteredEmployees = filteredEmployees.filter(e =>
                e.department?.toLowerCase() === targetDept.toLowerCase() ||
                (targetDept === 'Engineering' && e.department === 'Security') // Include security in IT/Eng
            );
        }

        setEmployeeTable(filteredEmployees);

        // Recalculate Metrics based on Filtered Employees
        const highRiskCount = filteredEmployees.filter(e => (e.risk_score || 0) > 50).length;
        const trainedCount = filteredEmployees.filter(e => e.last_security_training).length;
        const totalCount = filteredEmployees.length || 1;
        const trainingRate = Math.round((trainedCount / totalCount) * 100);

        // Approx recalculation for pending attestations (Mocked logic for UI responsiveness)
        // In real app, we'd filter acknowledgments too.
        const pending = Math.round(filteredEmployees.length * 1.5); // Mock: ~1.5 pending per employee

        const totalRisk = filteredEmployees.reduce((sum, e) => sum + (e.risk_score || 0), 0);
        const avgRisk = Math.round(totalRisk / totalCount);
        const securityScore = Math.max(0, 100 - avgRisk);

        setPeopleMetrics({
            highRiskEmployees: highRiskCount,
            trainingCompletion: trainingRate,
            pendingAttestations: pending,
            avgSecurityScore: securityScore
        });

        setData(filtered);
    }, [initialData, year, department, initialEmployees]);


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
                    <button className="btn-secondary" onClick={() => seedDatabase()} style={{ marginLeft: '10px', backgroundColor: '#f3f4f6', color: '#1f2937', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Database className="btn-icon" size={18} />
                        Seed DB (1.2k)
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

            <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as any)} />

            <div className="analytics-content">
                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                        <div className="loader"></div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'risk' && (
                            <>
                                <div className={`metrics-grid ${data.riskKpis.length > 3 ? 'metrics-grid-5' : ''}`} style={{ gridTemplateColumns: data.riskKpis.length > 3 ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(3, 1fr)' }}>
                                    {data.riskKpis.length > 0 ? (
                                        data.riskKpis.map((kpi, index) => (
                                            <Card key={index}>
                                                <div className="metric-header">
                                                    <span className="metric-title">{kpi.label}</span>
                                                    {kpi.label.includes('Critical') ? <AlertTriangle size={16} className="metric-icon negative" /> :
                                                        kpi.label.includes('Mitigation') ? <Activity size={16} className="metric-icon" /> :
                                                            kpi.label.includes('Velocity') ? <TrendingUp size={16} className="metric-icon" /> :
                                                                kpi.label.includes('Exposure') ? <Database size={16} className="metric-icon negative" /> :
                                                                    <Shield size={16} className="metric-icon" />}
                                                </div>
                                                <div className="metric-value">{kpi.value}</div>
                                                <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'positive' : kpi.trend_direction === 'down' ? 'negative' : 'neutral'}`}>
                                                    <span>{kpi.trend} {kpi.icon}</span>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card>
                                            <div className="metric-header"><span className="metric-title">Loading Metrics...</span></div>
                                        </Card>
                                    )}
                                </div>

                                <div className="charts-grid two-columns">
                                    {/* Risk Categories Chart */}
                                    <Card className="chart-card">
                                        <h3 className="chart-title">Risk Distribution by Category</h3>
                                        <div className="chart-container">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={data.riskCategories}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {data.riskCategories.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>

                                    {/* Mitigation Status Chart */}
                                    <Card className="chart-card">
                                        <h3 className="chart-title">Mitigation Status</h3>
                                        <div className="chart-container">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={data.riskMitigation} layout="vertical" margin={{ left: 40 }}>
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                                    <XAxis type="number" />
                                                    <YAxis dataKey="name" type="category" width={100} />
                                                    <Tooltip />
                                                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20}>
                                                        {data.riskMitigation.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
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

                                {/* Risk Register Table */}
                                <Card className="table-card" style={{ marginTop: '20px' }}>
                                    <h3 className="chart-title">Risk Register</h3>
                                    <div className="table-container">
                                        <table className="analytics-table">
                                            <thead>
                                                <tr>
                                                    <th>Risk Name</th>
                                                    <th>Category</th>
                                                    <th>Likelihood</th>
                                                    <th>Impact</th>
                                                    <th>Sensitivity</th>
                                                    <th>Owner</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {riskTable.map((risk, i) => (
                                                    <tr key={i}>
                                                        <td>
                                                            <div style={{ fontWeight: '500' }}>{risk.risk_id}</div>
                                                            <div style={{ fontSize: '11px', color: '#6b7280' }}>{risk.title}</div>
                                                        </td>
                                                        <td>{risk.category}</td>
                                                        <td>
                                                            <div className="progress-bar">
                                                                <div className="progress-fill" style={{ width: `${(risk.likelihood / 5) * 100}%`, backgroundColor: '#3b82f6' }}></div>
                                                            </div>
                                                            <span style={{ fontSize: '10px' }}>{risk.likelihood}/5</span>
                                                        </td>
                                                        <td>
                                                            <div className="progress-bar">
                                                                <div className="progress-fill" style={{ width: `${(risk.impact / 5) * 100}%`, backgroundColor: risk.impact > 3 ? '#ef4444' : '#f59e0b' }}></div>
                                                            </div>
                                                            <span style={{ fontSize: '10px' }}>{risk.impact}/5</span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${((risk.likelihood * risk.impact) > 15) ? 'negative' : ((risk.likelihood * risk.impact) > 8) ? 'warning' : 'positive'}`}>
                                                                {((risk.likelihood * risk.impact) > 15) ? 'Critical' : ((risk.likelihood * risk.impact) > 8) ? 'High' : 'Medium'}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div>{risk.owner}</div>
                                                            <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'capitalize' }}>{risk.status}</div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </>
                        )}

                        {activeTab === 'audit' && (
                            <>
                                <div className={`metrics-grid ${data.auditKpis.length > 3 ? 'metrics-grid-4' : ''}`} style={{ gridTemplateColumns: data.auditKpis.length > 3 ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(3, 1fr)' }}>
                                    {data.auditKpis.length > 0 ? (
                                        data.auditKpis.map((kpi, index) => (
                                            <Card key={index}>
                                                <div className="metric-header">
                                                    <span className="metric-title">{kpi.label}</span>
                                                    {kpi.label.includes('Open') ? <AlertCircle size={16} className="metric-icon warning" /> :
                                                        kpi.label.includes('Audits') ? <Activity size={16} className="metric-icon" /> :
                                                            kpi.label.includes('Rate') ? <CheckCircle size={16} className="metric-icon positive" /> :
                                                                <Shield size={16} className="metric-icon" />}
                                                </div>
                                                <div className="metric-value">{kpi.value}</div>
                                                <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'positive' : kpi.trend_direction === 'down' ? 'negative' : 'neutral'}`}>
                                                    <span>{kpi.trend} {kpi.icon}</span>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card><div className="metric-header"><span className="metric-title">Loading...</span></div></Card>
                                    )}
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

                                {/* Audit Findings Log Table */}
                                <Card className="table-card" style={{ marginTop: '20px' }}>
                                    <h3 className="chart-title">Audit Findings Log</h3>
                                    <div className="table-container">
                                        <table className="analytics-table">
                                            <thead>
                                                <tr>
                                                    <th>Finding ID</th>
                                                    <th>Description</th>
                                                    <th>Severity</th>
                                                    <th>Status</th>
                                                    <th>Owner</th>
                                                    <th>Due Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {auditTable.map((finding, i) => (
                                                    <tr key={i}>
                                                        <td>{finding.finding_code || `AF-${100 + i}`}</td>
                                                        <td>
                                                            <div title={finding.description} style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {finding.description}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`status-badge ${finding.severity === 'Critical' || finding.severity === 'High' ? 'negative' : finding.severity === 'Medium' ? 'warning' : 'positive'}`}>
                                                                {finding.severity}
                                                            </span>
                                                        </td>
                                                        <td>{finding.status}</td>
                                                        <td>{finding.owner || '-'}</td>
                                                        <td>{finding.remediation_due_date || '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </>
                        )}

                        {activeTab === 'compliance' && (
                            <>
                                <div className={`metrics-grid ${data.complianceKpis.length > 3 ? 'metrics-grid-4' : ''}`} style={{ gridTemplateColumns: data.complianceKpis.length > 3 ? 'repeat(auto-fit, minmax(200px, 1fr))' : 'repeat(3, 1fr)' }}>
                                    {data.complianceKpis.length > 0 ? (
                                        data.complianceKpis.map((kpi, index) => (
                                            <Card key={index}>
                                                <div className="metric-header">
                                                    <span className="metric-title">{kpi.label}</span>
                                                    {kpi.label.includes('Score') ? <Shield size={16} className="metric-icon positive" /> :
                                                        kpi.label.includes('Gaps') ? <AlertTriangle size={16} className="metric-icon warning" /> :
                                                            kpi.label.includes('Coverage') ? <Lock size={16} className="metric-icon" /> :
                                                                <CheckCircle size={16} className="metric-icon positive" />}
                                                </div>
                                                <div className="metric-value">{kpi.value}</div>
                                                <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'positive' : kpi.trend_direction === 'down' ? 'negative' : 'neutral'}`}>
                                                    <span>{kpi.trend} {kpi.icon}</span>
                                                </div>
                                            </Card>
                                        ))
                                    ) : (
                                        <Card><div className="metric-header"><span className="metric-title">Loading...</span></div></Card>
                                    )}
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

                                    {/* Policy Review Status Chart */}
                                    <Card className="chart-card">
                                        <h3 className="chart-title">Policy Review Status</h3>
                                        <div className="chart-container">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <PieChart>
                                                    <Pie
                                                        data={data.policyStatus}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {data.policyStatus.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip />
                                                    <Legend />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card>
                                </div>

                                <div className="charts-grid two-columns">
                                    {/* Control Effectiveness Chart */}
                                    <Card className="chart-card">
                                        <h3 className="chart-title">Control Effectiveness</h3>
                                        <div className="chart-container">
                                            <ResponsiveContainer width="100%" height={300}>
                                                <BarChart data={data.controlEffectiveness}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="category" />
                                                    <YAxis />
                                                    <Tooltip />
                                                    <Legend />
                                                    <Bar dataKey="Design" fill="#8b5cf6" />
                                                    <Bar dataKey="Operating" fill="#10b981" />
                                                </BarChart>
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

                                {/* Policy List Table */}
                                <Card className="table-card" style={{ marginTop: '20px' }}>
                                    <h3 className="chart-title">Policy Compliance List</h3>
                                    <div className="table-container">
                                        <table className="analytics-table">
                                            <thead>
                                                <tr>
                                                    <th>Policy Code</th>
                                                    <th>Version</th>
                                                    <th>Status</th>
                                                    <th>Last Review</th>
                                                    <th>Next Review</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {policyTable.map((policy, i) => (
                                                    <tr key={i}>
                                                        <td>
                                                            <div style={{ fontWeight: 600 }}>{policy.policy_code}</div>
                                                            <div style={{ fontSize: '12px', color: '#666' }}>{policy.title}</div>
                                                        </td>
                                                        <td>{policy.version}</td>
                                                        <td>
                                                            <span className={`status-badge ${policy.status === 'Active' ? 'positive' : 'warning'}`}>
                                                                {policy.status}
                                                            </span>
                                                        </td>
                                                        <td>{policy.last_review_date}</td>
                                                        <td>{policy.next_review_date}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </>
                        )}

                        {activeTab === 'people' && (
                            <>
                                <div className="metrics-grid metrics-grid-4">
                                    <Card className="metric-card">
                                        <div className="metric-header">
                                            <span className="metric-title">High Risk Employees</span>
                                            <AlertTriangle size={16} className="metric-icon negative" />
                                        </div>
                                        <div className="metric-value">{peopleMetrics.highRiskEmployees}</div>
                                        <div className="metric-trend negative"><span>Risk Score &gt; 50</span></div>
                                    </Card>
                                    <Card className="metric-card">
                                        <div className="metric-header">
                                            <span className="metric-title">Training Completion</span>
                                            <CheckCircle size={16} className="metric-icon positive" />
                                        </div>
                                        <div className="metric-value">{peopleMetrics.trainingCompletion}%</div>
                                        <div className="metric-trend positive"><span>Target: 95%</span></div>
                                    </Card>
                                    <Card className="metric-card">
                                        <div className="metric-header">
                                            <span className="metric-title">Pending Attestations</span>
                                            <Activity size={16} className="metric-icon warning" />
                                        </div>
                                        <div className="metric-value">{peopleMetrics.pendingAttestations}</div>
                                        <div className="metric-trend warning"><span>Require Follow-up</span></div>
                                    </Card>
                                    <Card className="metric-card">
                                        <div className="metric-header">
                                            <span className="metric-title">Avg Security Score</span>
                                            <Shield size={16} className="metric-icon positive" />
                                        </div>
                                        <div className="metric-value">{peopleMetrics.avgSecurityScore}/100</div>
                                        <div className="metric-trend neutral"><span>Stable</span></div>
                                    </Card>
                                </div>

                                <Card className="table-card" style={{ marginTop: '20px' }}>
                                    <h3 className="chart-title">People Assurance Roster</h3>
                                    <div className="table-container">
                                        <table className="analytics-table">
                                            <thead>
                                                <tr>
                                                    <th>Employee</th>
                                                    <th>Role</th>
                                                    <th>Department</th>
                                                    <th>Status</th>
                                                    <th>Risk Score</th>
                                                    <th>Last Training</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employeeTable.map((emp, i) => (
                                                    <tr key={i}>
                                                        <td style={{ fontWeight: 500 }}>{emp.full_name}</td>
                                                        <td>{emp.role}</td>
                                                        <td>{emp.department}</td>
                                                        <td>
                                                            <span className={`status-badge ${emp.status === 'Active' ? 'positive' : 'neutral'}`}>
                                                                {emp.status}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <div style={{
                                                                    width: '40px', height: '6px', borderRadius: '3px',
                                                                    backgroundColor: '#eee', overflow: 'hidden'
                                                                }}>
                                                                    <div style={{
                                                                        width: `${emp.risk_score}%`, height: '100%',
                                                                        backgroundColor: emp.risk_score > 30 ? '#ef4444' : '#10b981'
                                                                    }} />
                                                                </div>
                                                                <span style={{ color: emp.risk_score > 30 ? '#ef4444' : '#666' }}>{emp.risk_score}</span>
                                                            </div>
                                                        </td>
                                                        <td>{emp.last_security_training || 'N/A'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </Card>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
