import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Legend
} from 'recharts';
import { TrendingUp, Users, Clock, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import './Analytics.css';

import { analyticsService } from '../services/analyticsService';
import type { AnalyticsKPI } from '../services/analyticsService';
import { Select } from '../components/ui/Select';

export const Analytics: React.FC = () => {
    const [activeTab, setActiveTab] = useState('hris');
    const [isLoading, setIsLoading] = useState(true);
    // Data State
    const [data, setData] = useState<any>({
        // KPIs
        hrisKpis: [], recKpis: [], perfKpis: [], payrollKpis: [], sentimentKpis: [], requestKpis: [],

        // HRIS Charts
        headcountTrend: [], deptDistribution: [], perfDistribution: [], attritionTrend: [],
        hiringFunnel: [], perfVsTenure: [], compliance: [],

        // Recruitment Charts
        sourceOfHire: [], timeToHire: [], appsVsHires: [], rejectionReasons: [], pipelineStatus: [],

        // Performance Charts
        talentMatrix: [], deptPerf: [], reviewProgress: [], skillGap: [], trainingImpact: [], goalCompletion: [],

        // Payroll Charts
        payrollTrend: [], deptPayroll: [], salaryDist: [], budgetVsActual: [], compBreakdown: [],

        // Sentiment Charts
        sentimentTrend: [], sentimentCategory: [], deptSentiment: [],

        // Request Charts
        requestVolume: [], requestCategory: [], slaCompliance: []
    });

    // Filter States (Visual only for now)
    const [period, setPeriod] = useState('q1');
    const [department, setDepartment] = useState('all');

    useEffect(() => {
        const load = async () => {
            try {
                await analyticsService.seedData();
                const [
                    hrisKpis, recKpis, perfKpis, payrollKpis, sentimentKpis, requestKpis,

                    headcountTrend, attritionTrend, timeToHire, payrollTrend, sentimentTrend, requestVolume,

                    deptDistribution, perfDistribution, sourceOfHire, deptPayroll, requestCategory, sentimentCategory,
                    rejectionReasons, salaryDist, // New fetches

                    compliance, hiringFunnel, appsVsHires, talentMatrix, perfVsTenure, skillGap, trainingImpact, goalCompletion,
                    budgetVsActual, compBreakdown, deptSentiment, slaCompliance
                ] = await Promise.all([
                    analyticsService.getKPIs('hris'), analyticsService.getKPIs('recruitments'),
                    analyticsService.getKPIs('performance'), analyticsService.getKPIs('payroll'),
                    analyticsService.getKPIs('sentiments'), analyticsService.getKPIs('requests'),

                    analyticsService.getTrends('headcount_trend'), analyticsService.getTrends('attrition_trend'),
                    analyticsService.getTrends('time_to_hire_trend'), analyticsService.getTrends('payroll_trend'),
                    analyticsService.getTrends('sentiment_trend'), analyticsService.getTrends('request_volume'),

                    analyticsService.getCategories('dept_distribution'), analyticsService.getCategories('performance_distribution'),
                    analyticsService.getCategories('source_of_hire'), analyticsService.getCategories('payroll_by_dept'),
                    analyticsService.getCategories('request_category'), analyticsService.getCategories('sentiment_breakdown'),
                    analyticsService.getCategories('rejection_reasons'), analyticsService.getCategories('salary_distribution'),

                    analyticsService.getComplexData('compliance_heatmap'), analyticsService.getComplexData('hiring_funnel'),
                    analyticsService.getComplexData('apps_vs_hires'), analyticsService.getComplexData('talent_matrix'),
                    analyticsService.getComplexData('performance_vs_tenure'), analyticsService.getComplexData('skill_gap'),
                    analyticsService.getComplexData('training_impact'), analyticsService.getComplexData('goal_completion'),
                    analyticsService.getComplexData('budget_vs_actual'), analyticsService.getComplexData('compensation_breakdown'),
                    analyticsService.getComplexData('dept_sentiment'), analyticsService.getComplexData('sla_compliance')
                ]);

                // Mocks/Placeholders for missing seeds
                const deptPerf: any[] = [{ name: 'Eng', score: 4.2 }, { name: 'Sales', score: 3.8 }]; // missed seeding dept_perf
                const reviewProgress: any[] = [{ name: 'Completed', value: 85, color: '#10b981' }]; // missed seeding this
                const pipelineStatus = hiringFunnel; // Alias pipelines

                setData({
                    hrisKpis, recKpis, perfKpis, payrollKpis, sentimentKpis, requestKpis,
                    headcountTrend, deptDistribution, perfDistribution, attritionTrend,
                    hiringFunnel, perfVsTenure, compliance,
                    sourceOfHire, timeToHire, appsVsHires, rejectionReasons, pipelineStatus,
                    talentMatrix, deptPerf, reviewProgress, skillGap, trainingImpact, goalCompletion,
                    payrollTrend, deptPayroll, salaryDist, budgetVsActual, compBreakdown,
                    sentimentTrend, sentimentCategory, deptSentiment,
                    requestVolume, requestCategory, slaCompliance
                });
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        load();
    }, []);

    // ALIASING FOR JSX COMPATIBILITY
    const {
        headcountTrend: headcountTrendData,
        deptDistribution: departmentDistributionData,
        perfDistribution: performanceDistributionData,
        attritionTrend: attritionTrendData,
        hiringFunnel: hiringData,
        perfVsTenure: performanceData,
        compliance: complianceData,

        sourceOfHire: sourceOfHireData,
        timeToHire: timeToHireData,
        pipelineStatus: currentPipelineData,
        rejectionReasons: rejectionReasonsData,
        appsVsHires: applicationsVsHiresData,

        talentMatrix: nineBoxData,
        deptPerf: deptPerformanceData,
        reviewProgress: reviewProgressData,
        skillGap: skillGapData,
        trainingImpact: trainingImpactData,
        goalCompletion: goalCompletionData,

        payrollTrend: payrollTrendData,
        deptPayroll: deptPayrollData,
        salaryDist: salaryDistData,
        budgetVsActual: payrollBudgetVsActualData,
        compBreakdown: compensationComponentsData,

        sentimentTrend: sentimentTrendData,
        sentimentCategory: sentimentCategoryData,
        deptSentiment: deptSentimentData,

        requestVolume: requestVolumeData,
        requestCategory: requestCategoryData,
        slaCompliance: slaComplianceData
    } = data;

    /* Loading spinner removed to allow partial rendering */

    return (
        <div className="analytics-page">
            <h1 className="text-2xl font-bold mb-6">Workforce Analytics</h1>

            <Tabs
                tabs={[
                    { id: 'hris', label: 'HRIS Dashboard' },
                    { id: 'recruitments', label: 'Recruitments' },
                    { id: 'performance', label: 'HR Performance' },
                    { id: 'payroll', label: 'Payroll Analytics' },
                    { id: 'sentiments', label: 'Employee Sentiments' },
                    { id: 'requests', label: 'Request Analysis' }
                ]}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />



            {activeTab === 'payroll' && (
                <>
                    <div className="flex gap-4 mb-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                        <Select
                            className="w-48"
                            options={[
                                { value: 'all', label: 'All Departments' },
                                { value: 'engineering', label: 'Engineering' },
                                { value: 'sales', label: 'Sales' },
                                { value: 'marketing', label: 'Marketing' }
                            ]}
                        />
                        <Select
                            className="w-48"
                            options={[
                                { value: 'ytd', label: 'Year to Date' },
                                { value: 'q1', label: 'Q1' },
                                { value: 'q2', label: 'Q2' },
                            ]}
                        />
                    </div>

                    <div className="metrics-grid">
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Total Payroll</div>
                                <div className="text-green-600 bg-green-50 p-1 rounded">
                                    <span className="text-xs font-bold">$</span>
                                </div>
                            </div>
                            <div className="metric-value">$495,000</div>
                            <div className="metric-trend text-red-500">↑ 3.1% vs last month</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Avg Salary</div>
                                <Users size={16} className="text-gray-400" />
                            </div>
                            <div className="metric-value">$92,450</div>
                            <div className="metric-trend text-gray-500">Per Employee/Year</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Overtime Cost</div>
                                <Clock size={16} className="text-gray-400" />
                            </div>
                            <div className="metric-value">$22,000</div>
                            <div className="metric-trend text-red-500">↑ 12% vs last month</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Benefits Ratio</div>
                                <CheckCircle size={16} className="text-gray-400" />
                            </div>
                            <div className="metric-value">18.5%</div>
                            <div className="metric-trend text-green-600">Within budget (20%)</div>
                        </Card>
                    </div>

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Monthly Payroll Trend</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={payrollTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="period" />
                                        <YAxis tickFormatter={(value: any) => `$${value / 1000}k`} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip formatter={(value: any) => `$${value}`} />
                                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCost)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Payroll by Department</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={deptPayrollData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {deptPayrollData.map((entry: any, index: number) => (
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

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Salary Range Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={salaryDistData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Overtime Cost Trend</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={payrollTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip formatter={(value: any) => `$${value}`} />
                                        <Line type="monotone" dataKey="extra_value" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Budget vs Actual Spend</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <ComposedChart data={payrollBudgetVsActualData} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" />
                                        <YAxis tickFormatter={(value: any) => `$${value / 1000}k`} />
                                        <Tooltip formatter={(value: any) => `$${value}`} />
                                        <Legend />
                                        <Bar dataKey="budget" name="Budget" fill="#e5e7eb" barSize={30} radius={[4, 4, 0, 0]} />
                                        <Line type="monotone" dataKey="actual" name="Actual" stroke="#ef4444" strokeWidth={2} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Compensation Components (k)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={compensationComponentsData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="base" stackId="a" name="Base Salary" fill="#3b82f6" />
                                        <Bar dataKey="bonus" stackId="a" name="Bonus/Commission" fill="#10b981" />
                                        <Bar dataKey="benefits" stackId="a" name="Benefits" fill="#f59e0b" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </>
            )}
            {activeTab === 'hris' && (
                <>
                    <div className="flex gap-4 mb-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                        <Select
                            className="w-48"
                            options={[
                                { value: 'all', label: 'All Departments' },
                                { value: 'engineering', label: 'Engineering' },
                                { value: 'sales', label: 'Sales' },
                                { value: 'marketing', label: 'Marketing' },
                                { value: 'hr', label: 'Human Resources' }
                            ]}
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                        <Select
                            className="w-48"
                            options={[
                                { value: 'month', label: 'Last 30 Days' },
                                { value: 'q1', label: 'Q1 2024' },
                                { value: 'q2', label: 'Q2 2024' },
                                { value: 'ytd', label: 'Year to Date' }
                            ]}
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        />
                    </div>

                    <div className="metrics-grid">
                        <Card className="metric-card">
                            <div className="metric-label">Headcount</div>
                            <div className="metric-value">1,248</div>
                            <div className="metric-trend text-green-600">↑ 12% vs last quarter</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="metric-label">Attrition Risk</div>
                            <div className="metric-value text-amber-600">High</div>
                            <div className="metric-trend text-red-600">↑ 2.4% in Engineering</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="metric-label">Policy Violations</div>
                            <div className="metric-value">3</div>
                            <div className="metric-trend text-green-600">↓ 50% vs last month</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Avg Performance</div>
                                <TrendingUp size={16} className="text-gray-400" />
                            </div>
                            <div className="metric-value">3.8/5</div>
                            <div className="metric-trend text-gray-500">Based on 280 reviews</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Open Positions</div>
                                <Users size={16} className="text-gray-400" />
                            </div>
                            <div className="metric-value">24</div>
                            <div className="metric-trend text-gray-500">Across 8 departments</div>
                        </Card>
                    </div>

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Headcount Trend</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={headcountTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Department Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={departmentDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {departmentDistributionData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="flex flex-wrap justify-center gap-4 mt-4">
                                    {departmentDistributionData.map((d: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                            <span className="text-xs text-secondary">{d.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Performance Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={performanceDistributionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        />
                                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Attrition Rate Trend</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={attritionTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                        />
                                        <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Hiring Funnel Conversion</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={hiringData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="stage" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        />
                                        <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Performance vs Tenure</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" dataKey="tenure" name="Tenure" unit=" yrs" />
                                        <YAxis type="number" dataKey="rating" name="Rating" domain={[0, 5]} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter name="Employees" data={performanceData} fill="#8884d8" />
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <Card className="chart-placeholder h-auto">
                        <h3 className="chart-title">Department Compliance Heatmap</h3>
                        <div className="heatmap-container">
                            <div className="heatmap-header">
                                <div className="heatmap-cell align-left">Department</div>
                                <div className="heatmap-cell">GDPR Training</div>
                                <div className="heatmap-cell">Code of Conduct</div>
                                <div className="heatmap-cell">InfoSec Policy</div>
                            </div>
                            {complianceData.map((d: any, i: number) => (
                                <div key={i} className="heatmap-row">
                                    <div className="heatmap-cell align-left font-medium">{d.dept}</div>
                                    <div className="heatmap-cell">
                                        <span className={`compliance-badge ${getBadgeClass(d.gdpr)}`}>{d.gdpr}%</span>
                                    </div>
                                    <div className="heatmap-cell">
                                        <span className={`compliance-badge ${getBadgeClass(d.conduct)}`}>{d.conduct}%</span>
                                    </div>
                                    <div className="heatmap-cell">
                                        <span className={`compliance-badge ${getBadgeClass(d.infosec)}`}>{d.infosec}%</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </>
            )}

            {
                activeTab === 'recruitments' && (
                    <>
                        <div className="flex gap-4 mb-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                            <Select
                                className="w-48"
                                options={[
                                    { value: 'all', label: 'All Roles' },
                                    { value: 'tech', label: 'Tech / Engineering' },
                                    { value: 'sales', label: 'Sales & Marketing' },
                                    { value: 'ops', label: 'Operations' }
                                ]}
                            />
                            <Select
                                className="w-48"
                                options={[
                                    { value: 'month', label: 'Last 30 Days' },
                                    { value: 'quarter', label: 'This Quarter' },
                                    { value: 'year', label: 'This Year' }
                                ]}
                            />
                        </div>

                        <div className="metrics-grid">
                            <Card className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">Total Applicants</div>
                                    <Users size={16} className="text-gray-400" />
                                </div>
                                <div className="metric-value">850</div>
                                <div className="metric-trend text-green-600">↑ 18% vs last month</div>
                            </Card>
                            <Card className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">Open Roles</div>
                                    <Users size={16} className="text-gray-400" />
                                </div>
                                <div className="metric-value">24</div>
                                <div className="metric-trend text-green-600">6 urgent priority</div>
                            </Card>
                            <Card className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">Avg Time to Hire</div>
                                    <Clock size={16} className="text-gray-400" />
                                </div>
                                <div className="metric-value">26 days</div>
                                <div className="metric-trend text-green-600">↓ 15% vs last qtr</div>
                            </Card>
                            <Card className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">Offer Acceptance</div>
                                    <CheckCircle size={16} className="text-gray-400" />
                                </div>
                                <div className="metric-value">82%</div>
                                <div className="metric-trend text-gray-400">Industry avg: 70%</div>
                            </Card>
                        </div>

                        <div className="charts-grid">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Hiring Pipeline Status</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={currentPipelineData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="stage" type="category" width={100} />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Source of Hire</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={sourceOfHireData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {sourceOfHireData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                                        {sourceOfHireData.map((d: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                                <span className="text-xs text-secondary">{d.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Time to Hire Trend (Days)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={timeToHireData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorTime" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorTime)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        <div className="charts-grid mt-6">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Offer Rejection Reasons</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={rejectionReasonsData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="reason" type="category" width={100} tick={{ fontSize: 11 }} />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="count" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} name="Rejections" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Application Volume vs Hires</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <ComposedChart data={applicationsVsHiresData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" />
                                            <Tooltip />
                                            <Legend />
                                            <Area yAxisId="left" type="monotone" dataKey="applicants" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" name="Applicants" />
                                            <Line yAxisId="right" type="monotone" dataKey="hires" stroke="#10b981" strokeWidth={3} name="Hires" />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </>
                )
            }

            {
                activeTab === 'performance' && (
                    <>
                        <div className="flex gap-4 mb-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                            <Select
                                className="w-48"
                                options={[
                                    { value: 'all', label: 'All Departments' },
                                    { value: 'engineering', label: 'Engineering' },
                                    { value: 'sales', label: 'Sales' },
                                    { value: 'marketing', label: 'Marketing' },
                                    { value: 'hr', label: 'Human Resources' }
                                ]}
                            />
                            <Select
                                className="w-48"
                                options={[
                                    { value: 'cy', label: 'Current Cycle' },
                                    { value: 'py', label: 'Previous Cycle' },
                                ]}
                            />
                        </div>

                        <div className="metrics-grid">
                            <Card className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">Avg Review Score</div>
                                    <TrendingUp size={16} className="text-gray-400" />
                                </div>
                                <div className="metric-value">4.1</div>
                                <div className="metric-trend text-green-600">↑ 0.3 vs last cycle</div>
                            </Card>
                            <Card className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">Reviews Completed</div>
                                    <CheckCircle size={16} className="text-gray-400" />
                                </div>
                                <div className="metric-value">85%</div>
                                <div className="metric-trend text-blue-600">423/498 Employees</div>
                            </Card>
                            <Card className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">Promotion Ready</div>
                                    <Users size={16} className="text-gray-400" />
                                </div>
                                <div className="metric-value">32</div>
                                <div className="metric-trend text-gray-500">12 Pending Approval</div>
                            </Card>
                            <Card className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">PIP Cases</div>
                                    <Clock size={16} className="text-gray-400" />
                                </div>
                                <div className="metric-value text-red-600">5</div>
                                <div className="metric-trend text-red-600">Requires Action</div>
                            </Card>
                        </div>

                        <div className="charts-grid">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Talent Matrix (9-Box Grid)</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis type="number" dataKey="performance" name="Performance" domain={[0, 10]} label={{ value: 'Performance', position: 'bottom', offset: 0 }} />
                                            <YAxis type="number" dataKey="potential" name="Potential" domain={[0, 10]} label={{ value: 'Potential', angle: -90, position: 'insideLeft' }} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                            <Scatter name="Employees" data={nineBoxData} fill="#8884d8">
                                                {nineBoxData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.performance > 7 && entry.potential > 7 ? '#10b981' : '#3b82f6'} />
                                                ))}
                                            </Scatter>
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Average Performance by Department</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={deptPerformanceData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                            <YAxis domain={[0, 5]} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            />
                                            <Bar dataKey="score" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        <div className="charts-grid">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Review Cycle Progress</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={reviewProgressData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {reviewProgressData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="flex flex-wrap justify-center gap-4 mt-4">
                                        {reviewProgressData.map((d: any, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                                                <span className="text-xs text-secondary">{d.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Skills Gap Analysis</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillGapData}>
                                            <PolarGrid />
                                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                                            <PolarRadiusAxis />
                                            <Radar name="Required" dataKey="B" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                            <Radar name="Actual" dataKey="A" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                            <Legend />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        <div className="charts-grid">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Training Impact on Performance</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <ComposedChart data={trainingImpactData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis yAxisId="left" />
                                            <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                                            <Tooltip />
                                            <Legend />
                                            <Bar yAxisId="left" dataKey="hours" name="Training Hours" fill="#3b82f6" barSize={30} radius={[4, 4, 0, 0]} />
                                            <Line yAxisId="right" type="monotone" dataKey="score" name="Avg Perf Score" stroke="#ef4444" strokeWidth={2} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Department Goal Completion</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={goalCompletionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                                            <Bar dataKey="pending" stackId="a" fill="#e5e7eb" name="Pending" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </>
                )
            }

            {activeTab === 'sentiments' && (
                <>
                    <div className="flex gap-4 mb-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                        <Select
                            className="w-48"
                            options={[
                                { value: 'all', label: 'All Departments' },
                                { value: 'engineering', label: 'Engineering' },
                                { value: 'sales', label: 'Sales' },
                                { value: 'marketing', label: 'Marketing' }
                            ]}
                        />
                        <Select
                            className="w-48"
                            options={[
                                { value: 'q1', label: 'Q1 2024' },
                                { value: 'q2', label: 'Q2 2024' },
                            ]}
                        />
                    </div>

                    <div className="metrics-grid">
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">eNPS Score</div>
                                <div className="text-blue-600 bg-blue-50 p-1 rounded">
                                    <span className="text-xs font-bold">+</span>
                                </div>
                            </div>
                            <div className="metric-value">42</div>
                            <div className="metric-trend text-green-600">↑ 4 pts vs last survey</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Participation Rate</div>
                                <Users size={16} className="text-gray-400" />
                            </div>
                            <div className="metric-value">88%</div>
                            <div className="metric-trend text-green-600">All-time high</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Sentiment Score</div>
                                <CheckCircle size={16} className="text-gray-400" />
                            </div>
                            <div className="metric-value">4.1/5</div>
                            <div className="metric-trend text-gray-500">Industry: 3.8</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Top Driver</div>
                                <TrendingUp size={16} className="text-gray-400" />
                            </div>
                            <div className="metric-value text-sm">Culture & Values</div>
                            <div className="metric-trend text-green-600">Very High Impact</div>
                        </Card>
                    </div>

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">eNPS Trend</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={sentimentTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="coloreNPS" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="period" />
                                        <YAxis domain={[0, 100]} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#coloreNPS)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Sentiment Category Breakdown</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sentimentCategoryData}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="label" tick={{ fontSize: 10 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                        <Radar name="Score" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                        <Legend />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Sentiment by Department (%)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={deptSentimentData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="name" type="category" width={80} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="positive" stackId="a" name="Positive" fill="#10b981" barSize={30} />
                                        <Bar dataKey="neutral" stackId="a" name="Neutral" fill="#f59e0b" barSize={30} />
                                        <Bar dataKey="negative" stackId="a" name="Negative" fill="#ef4444" barSize={30} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {activeTab === 'requests' && (
                <>
                    <div className="flex gap-4 mb-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                        <Select
                            className="w-48"
                            options={[
                                { value: 'all', label: 'All Categories' },
                                { value: 'it', label: 'IT Support' },
                                { value: 'hr', label: 'HR Support' },
                                { value: 'facilities', label: 'Facilities' }
                            ]}
                        />
                        <Select
                            className="w-48"
                            options={[
                                { value: 'week', label: 'Last 7 Days' },
                                { value: 'month', label: 'Last 30 Days' },
                            ]}
                        />
                    </div>

                    <div className="metrics-grid">
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Total Requests</div>
                                <div className="text-blue-600 bg-blue-50 p-1 rounded">
                                    <span className="text-xs font-bold">#</span>
                                </div>
                            </div>
                            <div className="metric-value">145</div>
                            <div className="metric-trend text-red-500">↑ 12% this week</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">Avg Resolution Time</div>
                                <Clock size={16} className="text-gray-400" />
                            </div>
                            <div className="metric-value">4.2 hrs</div>
                            <div className="metric-trend text-green-600">↓ 1.5 hrs vs target</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">SLA Breach Rate</div>
                                <div className="text-red-600 bg-red-50 p-1 rounded">
                                    <span className="text-xs font-bold">!</span>
                                </div>
                            </div>
                            <div className="metric-value">3.4%</div>
                            <div className="metric-trend text-green-600">Below 5% target</div>
                        </Card>
                        <Card className="metric-card">
                            <div className="flex justify-between items-start w-full">
                                <div className="metric-label">User Satisfaction</div>
                                <CheckCircle size={16} className="text-gray-400" />
                            </div>
                            <div className="metric-value">4.8/5</div>
                            <div className="metric-trend text-gray-500">Based on 120 ratings</div>
                        </Card>
                    </div>

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Request Volume (New vs Resolved)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={requestVolumeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="New Requests" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="extra_value" name="Resolved" fill="#10b981" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Requests by Category</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={requestCategoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {requestCategoryData.map((entry: any, index: number) => (
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

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">SLA Compliance by Department (%)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={slaComplianceData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis dataKey="dept" type="category" width={100} tick={{ fontSize: 11 }} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="met" stackId="a" name="SLA Met" fill="#10b981" barSize={30} />
                                        <Bar dataKey="breached" stackId="a" name="SLA Breached" fill="#ef4444" barSize={30} radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div >
    );
};


// Helper for badge styling
const getBadgeClass = (score: number) => {
    if (score >= 95) return 'badge-success';
    if (score >= 85) return 'badge-warning';
    return 'badge-danger';
};
