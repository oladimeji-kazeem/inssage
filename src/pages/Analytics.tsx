import React, { useState, useEffect } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, AreaChart, Area, PieChart, Pie, Cell, LineChart, Line,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart, Legend, ReferenceLine, LabelList
} from 'recharts';
import { TrendingUp, Users, Clock, CheckCircle, Download, DollarSign } from 'lucide-react';
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
        lifeBalanceKpis: [], skillsKpis: [], trainingKpis: [], goalsKpis: [], assetsKpis: [], // NEW KPIs

        // HRIS Charts
        headcountTrend: [], deptDistribution: [], perfDistribution: [], attritionTrend: [],
        hiringFunnel: [], perfVsTenure: [], compliance: [],
        demographicsGender: [], demographicsAge: [], tenureDistribution: [], absenteeismTrend: [],

        // Recruitment Charts
        sourceOfHire: [], timeToHire: [], appsVsHires: [], rejectionReasons: [], pipelineStatus: [],
        recruiterPerformance: [], timeToFillRole: [], costPerHireTrend: [], qualityOfHireTrend: [],

        // Performance Charts
        talentMatrix: [], deptPerf: [], reviewProgress: [], skillGap: [], trainingImpact: [], goalCompletion: [],
        promotionReadiness: [], pipOutcomes: [], managerBias: [], highPerformerRetention: [],

        // Payroll Charts
        payrollTrend: [], deptPayroll: [], salaryDist: [], budgetVsActual: [], compBreakdown: [],
        genderPayGap: [], benefitsAdoption: [], costPerHeadTrend: [], overtimeByDept: [],

        // Sentiment Charts
        sentimentTrend: [], sentimentCategory: [], deptSentiment: [],
        enpsDist: [], sentimentTenure: [], keyDrivers: [], responseRate: [],

        // Request Charts
        requestVolume: [], requestCategory: [], slaCompliance: [],
        resolutionTime: [], requestStatus: [], agentPerf: [], backlogTrend: [],
        ticketReopenRate: [], // Explicitly init

        // NEW TABS CHARTS
        leaveUtilization: [], proficiencyDist: [], topCourses: [], goalStatus: [], assetTypes: [],
        // ADVANCED
        keyResults: [], wfhTrends: [], skillHeatmap: null, roiAnalysis: null, warrantyTimeline: [],
        // NEW LIFE BALANCE EXPANSION
        overtimeTrends: [], workPatterns: [], wellnessEngagement: [], burnoutRisk: null,
        // NEW SKILLS EXPANSION
        skillAcquisition: [], skillSupplyDemand: null,
        // NEW TRAINING EXPANSION
        providerSpend: [], certStatus: [], hoursByDept: [],

    });

    // Filter States (Visual only for now)
    const [period, setPeriod] = useState('q1');
    const [department, setDepartment] = useState('all');
    const [employmentType, setEmploymentType] = useState('all');
    const [recruiter, setRecruiter] = useState('all');
    const [jobLevel, setJobLevel] = useState('all');
    const [location, setLocation] = useState('all');
    const [priority, setPriority] = useState('all');
    const [category, setCategory] = useState('all');
    const [survey, setSurvey] = useState('all');
    // New Tab Filters
    const [skillCategory, setSkillCategory] = useState('all');
    const [assetType, setAssetType] = useState('all');
    const [trainingProvider, setTrainingProvider] = useState('all');


    useEffect(() => {
        const load = async () => {
            try {
                // Data seeding handled by caller or initial check
                // await analyticsService.seedData(); 
                // await analyticsService.ensurePerformanceData();

                const results = await Promise.all([
                    analyticsService.getKPIs('hris'), analyticsService.getKPIs('recruitments'),
                    analyticsService.getKPIs('performance'), analyticsService.getKPIs('payroll'),
                    analyticsService.getKPIs('sentiments'), analyticsService.getKPIs('requests'),
                    analyticsService.getKPIs('life_balance'), analyticsService.getKPIs('skills'),
                    analyticsService.getKPIs('training'), analyticsService.getKPIs('goals'),
                    analyticsService.getKPIs('assets'),

                    analyticsService.getTrends('headcount_trend'), analyticsService.getTrends('attrition_trend'),
                    analyticsService.getTrends('time_to_hire_trend'), analyticsService.getTrends('payroll_trend'),
                    analyticsService.getTrends('sentiment_trend'), analyticsService.getTrends('request_volume'),

                    analyticsService.getCategories('dept_distribution'), analyticsService.getCategories('performance_distribution'),
                    analyticsService.getCategories('source_of_hire'), analyticsService.getCategories('payroll_by_dept'),
                    analyticsService.getCategories('request_category'), analyticsService.getCategories('sentiment_breakdown'),
                    analyticsService.getCategories('rejection_reasons'), analyticsService.getCategories('salary_distribution'),

                    analyticsService.getCategories('demographics_gender'), analyticsService.getCategories('demographics_age'),
                    analyticsService.getCategories('tenure_distribution'), analyticsService.getTrends('absenteeism_trend'),

                    analyticsService.getCategories('recruiter_performance'), analyticsService.getCategories('time_to_fill_role'),
                    analyticsService.getTrends('cost_per_hire_trend'), analyticsService.getTrends('quality_of_hire_trend'),

                    analyticsService.getCategories('promotion_readiness'), analyticsService.getCategories('pip_outcomes'),
                    analyticsService.getCategories('manager_bias'), analyticsService.getTrends('high_performer_retention'),

                    analyticsService.getCategories('gender_pay_gap'), analyticsService.getCategories('benefits_adoption'),
                    analyticsService.getTrends('cost_per_head_trend'), analyticsService.getCategories('overtime_by_dept'),

                    analyticsService.getCategories('enps_distribution'), analyticsService.getCategories('sentiment_by_tenure'),
                    analyticsService.getCategories('key_drivers'), analyticsService.getTrends('response_rate_trend'),

                    analyticsService.getComplexData('compliance_heatmap'), analyticsService.getComplexData('hiring_funnel'),
                    analyticsService.getComplexData('apps_vs_hires'), analyticsService.getComplexData('talent_matrix'),
                    analyticsService.getComplexData('performance_vs_tenure'), analyticsService.getComplexData('skill_gap'),
                    analyticsService.getComplexData('training_impact'), analyticsService.getComplexData('goal_completion'),
                    analyticsService.getComplexData('budget_vs_actual'), analyticsService.getComplexData('compensation_breakdown'),
                    analyticsService.getComplexData('dept_sentiment'), analyticsService.getComplexData('sla_compliance'),

                    analyticsService.getCategories('resolution_time'), analyticsService.getCategories('request_status'),
                    analyticsService.getCategories('agent_perf'), analyticsService.getTrends('backlog_trend'),

                    analyticsService.getCategories('dept_perf'), analyticsService.getCategories('review_progress'),
                    analyticsService.getCategories('succession_planning'), analyticsService.getCategories('benefit_cost_dist'),
                    analyticsService.getCategories('participation_by_dept'), analyticsService.getTrends('ticket_reopen_rate'),

                    // NEW CALLS
                    analyticsService.getCategories('leave_utilization'), analyticsService.getCategories('proficiency_dist'),
                    analyticsService.getCategories('top_courses'), analyticsService.getCategories('goal_status'),
                    analyticsService.getCategories('asset_types'),

                    // ADVANCED CALLS
                    analyticsService.getKeyResults(), analyticsService.getTrends('wfh_trends'),
                    analyticsService.getKeyResults(), analyticsService.getTrends('wfh_trends'),
                    analyticsService.getComplexData('skill_heatmap'), analyticsService.getComplexData('roi_analysis'),
                    analyticsService.getComplexData('warranty_list'),

                    // LIFE BALANCE EXPANSION
                    analyticsService.getTrends('overtime_trends'), analyticsService.getCategories('work_patterns'),
                    analyticsService.getCategories('wellness_engagement'), analyticsService.getComplexData('burnout_risk'),

                    // SKILLS EXPANSION
                    analyticsService.getTrends('skill_acquisition'), analyticsService.getComplexData('skill_radar'),

                    // TRAINING EXPANSION
                    analyticsService.getCategories('provider_spend'), analyticsService.getCategories('cert_status'),
                    analyticsService.getCategories('provider_spend'), analyticsService.getCategories('cert_status'),
                    analyticsService.getCategories('hours_by_dept'),

                    // GOALS EXPANSION
                    analyticsService.getCategories('goal_distribution'), analyticsService.getTrends('goal_history'),
                    analyticsService.getCategories('goal_types'), analyticsService.getCategories('team_goal_perf'),
                    analyticsService.getCategories('active_goals_progress'),

                    // ASSETS EXPANSION
                    analyticsService.getCategories('asset_age_dist'), analyticsService.getCategories('assets_by_vendor'),
                    analyticsService.getCategories('license_utilization'), analyticsService.getTrends('maintenance_costs')
                ]);



                const [
                    hrisKpis, recKpis, perfKpis, payrollKpis, sentimentKpis, requestKpis,
                    lifeBalanceKpis, skillsKpis, trainingKpis, goalsKpis, assetsKpis, // 1-11

                    headcountTrend, attritionTrend, timeToHire, payrollTrend, sentimentTrend, requestVolume,

                    deptDistribution, perfDistribution, sourceOfHire, deptPayroll, requestCategory, sentimentCategory,
                    rejectionReasons, salaryDist,

                    demographicsGender, demographicsAge, tenureDistribution, absenteeismTrend,

                    recruiterPerformance, timeToFillRole, costPerHireTrend, qualityOfHireTrend,

                    promotionReadiness, pipOutcomes, managerBias, highPerformerRetention,

                    genderPayGap, benefitsAdoption, costPerHeadTrend, overtimeByDept,

                    enpsDist, sentimentTenure, keyDrivers, responseRate,

                    compliance, hiringFunnel, appsVsHires, talentMatrix, perfVsTenure, skillGap, trainingImpact, goalCompletion,
                    budgetVsActual, compBreakdown, deptSentiment, slaCompliance,

                    resolutionTime, requestStatus, agentPerf, backlogTrend,

                    deptPerf, reviewProgress,
                    successionPlanning, benefitsDistribution, participationByDept, ticketReopenRate,

                    // NEW CALLS
                    leaveUtilization, proficiencyDist, topCourses, goalStatus, assetTypes,
                    // ADVANCED
                    keyResults, wfhTrends, skillHeatmap, roiAnalysis, warrantyList,
                    overtimeTrends, workPatterns, wellnessEngagement, burnoutRisk,
                    skillAcquisition, skillSupplyDemand,

                    // TRAINING EXPANSION
                    providerSpend, certStatus, hoursByDept,

                    // GOALS EXPANSION
                    goalDistribution, goalHistory, goalTypes, teamGoalPerf, activeGoalsProgress,

                    // ASSETS EXPANSION
                    assetAgeDist, assetsByVendor, licenseUtilization, maintenanceCosts
                ] = results;
                const pipelineStatus = hiringFunnel; // Alias pipelines

                // Log removed
                const trainingImpactRes = await analyticsService.getComplexData('training_impact');
                const trainingImpactFixed = trainingImpactRes?.find((item: any) => Array.isArray(item) && item.length > 0 && item[0].name) || [];



                // Aggregate Key Results into Goals
                const processedKeyResults = Object.values((keyResults || []).reduce((acc: any, kr: any) => {
                    const goalTitle = kr.goal?.title || 'General Objectives';
                    if (!acc[goalTitle]) {
                        acc[goalTitle] = {
                            title: goalTitle,
                            progress: 0,
                            key_results: []
                        };
                    }
                    acc[goalTitle].key_results.push({
                        title: kr.description || kr.title,
                        current: kr.current_value,
                        target: kr.target_value
                    });
                    return acc;
                }, {})).map((g: any) => {
                    const totalProgress = g.key_results.reduce((sum: number, k: any) => {
                        const p = (k.current / (k.target || 1)) * 100;
                        return sum + (isNaN(p) ? 0 : p);
                    }, 0);
                    g.progress = Math.round(totalProgress / (g.key_results.length || 1));
                    return g;
                });

                setData({
                    hrisKpis, recKpis, perfKpis, payrollKpis, sentimentKpis, requestKpis,
                    lifeBalanceKpis, skillsKpis, trainingKpis, goalsKpis, assetsKpis,

                    headcountTrend, deptDistribution, perfDistribution, attritionTrend,
                    hiringFunnel, perfVsTenure,
                    demographicsGender, demographicsAge, tenureDistribution, absenteeismTrend,
                    sourceOfHire, timeToHire, appsVsHires, rejectionReasons,
                    recruiterPerformance, timeToFillRole, costPerHireTrend, qualityOfHireTrend,
                    talentMatrix, deptPerf, reviewProgress,
                    skillGap: skillGap || [],
                    trainingImpact: trainingImpact || [],
                    goalCompletion: goalCompletion || [],
                    successionPlanning,
                    promotionReadiness, pipOutcomes, managerBias, highPerformerRetention, benefitsDistribution, participationByDept, ticketReopenRate,

                    payrollTrend, deptPayroll, salaryDist,
                    budgetVsActual: budgetVsActual || [],
                    compBreakdown: compBreakdown || [],
                    genderPayGap, benefitsAdoption, costPerHeadTrend, overtimeByDept,

                    sentimentTrend, sentimentCategory,
                    deptSentiment: deptSentiment || [],
                    enpsDist, sentimentTenure, keyDrivers, responseRate,

                    requestVolume, requestCategory,
                    slaCompliance: slaCompliance || [],
                    resolutionTime, requestStatus, agentPerf, backlogTrend,

                    pipelineStatus,

                    leaveUtilization, proficiencyDist, topCourses, goalStatus, assetTypes,
                    keyResults: processedKeyResults, wfhTrends, warrantyList,
                    overtimeTrends, workPatterns, wellnessEngagement,
                    skillAcquisition,

                    // GOALS
                    goalDistribution, goalHistory, goalTypes, teamGoalPerf, activeGoalsProgress,

                    // ASSETS
                    assetAgeDist, assetsByVendor, licenseUtilization, maintenanceCosts,

                    // Unwrap Arrays
                    providerSpend: Array.isArray(providerSpend) ? providerSpend : [],
                    certStatus: Array.isArray(certStatus) ? certStatus : [],
                    hoursByDept: Array.isArray(hoursByDept) ? hoursByDept : [],

                    skillHeatmap: skillHeatmap ? skillHeatmap[0] : {},
                    roiAnalysis: roiAnalysis[0] || {},
                    burnoutRisk: burnoutRisk[0] || {},
                    skillSupplyDemand: skillSupplyDemand || [],

                    trainingImpact: trainingImpactFixed,

                    compliance: compliance || []
                });


                // Log removed
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        // FORCE SEED for new features
        analyticsService.seedData().then(() => {
            load();
        });
    }, []);

    // FILTERING LOGIC
    const [filteredData, setFilteredData] = useState<any>(null);

    useEffect(() => {
        if (!data) return;

        // Shallow copy is sufficient and safer for Top-Level component state
        let res = { ...data };

        // 1. Department Filter (Mock Scaling)
        if (department !== 'all') {
            const scale = 0.35 + (Math.random() * 0.1); // ~35-45% of total for a dept

            // Helper to scale generic objects
            const scaleVal = (val: string | number) => {
                if (typeof val === 'string' && val.includes('%')) return val;
                if (typeof val === 'string') {
                    const num = parseFloat(val.replace(/,/g, '').replace(/\$/g, ''));
                    if (!isNaN(num)) return Math.floor(num * scale).toLocaleString();
                    return val;
                }
                if (typeof val === 'number') return Math.floor(val * scale);
                return val;
            };

            // Scale KPIs
            ['hrisKpis', 'recKpis', 'perfKpis', 'payrollKpis', 'sentimentKpis', 'requestKpis',
                'lifeBalanceKpis', 'skillsKpis', 'trainingKpis', 'goalsKpis', 'assetsKpis'].forEach(key => {
                    if (res[key]) res[key] = res[key].map((k: any) => ({ ...k, value: scaleVal(k.value) }));
                });

            // Scale Trends
            ['headcountTrend', 'attritionTrend', 'timeToHire', 'payrollTrend', 'sentimentTrend', 'requestVolume', 'costPerHireTrend', 'ticketReopenRate'].forEach(key => {
                if (res[key]) res[key] = res[key].map((t: any) => ({ ...t, value: scaleVal(t.value) }));
            });

            // Scale Categories
            ['deptDistribution', 'perfDistribution', 'sourceOfHire', 'deptPayroll', 'requestCategory', 'salaryDist',
                'deptPerf', 'reviewProgress', 'skillGap', 'trainingImpact', 'goalCompletion',
                'promotionReadiness', 'pipOutcomes', 'managerBias', 'highPerformerRetention',
                'genderPayGap', 'benefitsAdoption', 'overtimeByDept', 'backlogTrend',
                'enpsDist', 'sentimentTenure', 'keyDrivers', 'participationByDept',
                'slaCompliance', 'resolutionTime', 'requestStatus', 'agentPerf', 'successionPlanning', 'benefitsDistribution',
                'leaveUtilization', 'proficiencyDist', 'topCourses', 'goalStatus', 'assetTypes'].forEach(key => {
                    if (res[key]) res[key] = res[key].map((c: any) => ({ ...c, value: scaleVal(c.value) }));
                });

            if (res.talentMatrix) res.talentMatrix = res.talentMatrix.filter(() => Math.random() > 0.2); // Random drop for 9-box
            if (res.budgetVsActual) res.budgetVsActual = res.budgetVsActual.map((d: any) => ({ ...d, actual: scaleVal(d.actual) }));
        }

        // 2. Time Period Filter
        if (period !== 'ytd') {
            const monthsMap: Record<string, string[]> = {
                'month': ['May', 'Jun'], // Assuming current is June
                'q1': ['Jan', 'Feb', 'Mar'],
                'q2': ['Apr', 'May', 'Jun'],
                'quarter': ['Apr', 'May', 'Jun'],
                'cy': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                'py': [],
            };
            const targetMonths = monthsMap[period] || [];

            if (targetMonths.length > 0) {
                // Filter all trend arrays
                Object.keys(res).forEach(key => {
                    if (Array.isArray(res[key]) && res[key].length > 0 && res[key][0].period) {
                        res[key] = res[key].filter((d: any) => targetMonths.includes(d.period));
                    }
                });
            }
        }

        // 3. Job Level Filter (Performance) - Mock
        if (jobLevel && jobLevel !== 'all') {
            const levelScale = 0.8;
            ['perfKpis', 'deptPerf', 'promotionReadiness'].forEach(key => {
                if (res[key]) res[key] = res[key].map((k: any) => ({ ...k, value: typeof k.value === 'number' ? Math.floor(k.value * levelScale) : k.value }));
            });
        }

        // 4. Location Filter (Payroll) - Mock
        if (location && location !== 'all') {
            const locScale = 0.9;
            ['payrollKpis', 'payrollTrend', 'overtimeByDept'].forEach(key => {
                if (res[key]) res[key] = res[key].map((k: any) => ({ ...k, value: typeof k.value === 'number' ? Math.floor(k.value * locScale) : k.value }));
            });
        }

        // 5. Recruiter Filter (Mock)
        if (recruiter !== 'all') {
            const modifier = recruiter === 'sarah' ? 1.1 : 0.9;
            if (res.recKpis) res.recKpis = res.recKpis.map((k: any) =>
                typeof k.value === 'number' ? { ...k, value: Math.floor(k.value * modifier) } : k
            );
            if (res.hiringFunnel) res.hiringFunnel = res.hiringFunnel.map((d: any) => ({ ...d, count: Math.floor(d.count * modifier) }));
            if (res.recruiterPerformance) res.recruiterPerformance = res.recruiterPerformance.filter((d: any) => d.label.toLowerCase().includes(recruiter));
        }

        // 6. Request Category Filter
        if (category !== 'all') {
            if (res.requestCategory) res.requestCategory = res.requestCategory.filter((c: any) => c.name.toLowerCase().includes(category) || category === 'all');
            // Mock impact on volume
            if (res.requestVolume) res.requestVolume = res.requestVolume.map((v: any) => ({ ...v, value: Math.floor(v.value * (priority === 'high' ? 0.2 : 0.5)) })); // Fix priority if used here
        }

        // 7. Request Priority Filter
        if (priority !== 'all') {
            if (res.requestVolume) res.requestVolume = res.requestVolume.map((v: any) => ({ ...v, value: Math.floor(v.value * (priority === 'high' ? 0.2 : 0.5)) }));
        }

        // 8. Survey Filter
        if (survey !== 'all') {
            if (res.sentimentTrend) res.sentimentTrend = res.sentimentTrend.map((t: any) => ({ ...t, value: Math.max(0, Math.min(100, t.value + (Math.random() * 20 - 10))) }));
        }

        // 9. Skill Category Filter (Mock)
        if (skillCategory !== 'all') {
            const scale = 0.6;
            const scaleValLocal = (val: any) => {
                if (typeof val === 'number') return Math.floor(val * scale);
                if (typeof val === 'string' && !val.includes('%')) {
                    const num = parseFloat(val.replace(/,/g, ''));
                    if (!isNaN(num)) return Math.floor(num * scale).toLocaleString();
                }
                return val;
            };
            if (res.skillsKpis) res.skillsKpis = res.skillsKpis.map((k: any) => ({ ...k, value: scaleValLocal(k.value) }));
            if (res.proficiencyDist) res.proficiencyDist = res.proficiencyDist.map((c: any) => ({ ...c, value: scaleValLocal(c.value) }));
            if (res.skillHeatmap && res.skillHeatmap.matrix) {
                res.skillHeatmap.matrix = res.skillHeatmap.matrix.map((c: any) => ({ ...c, value: scaleValLocal(c.value) }));
            }
        }

        // 10. Asset Type Filter
        if (assetType !== 'all') {
            const scale = 0.4;
            const scaleValLocal = (val: any) => {
                if (typeof val === 'number') return Math.floor(val * scale);
                if (typeof val === 'string' && !val.includes('%')) {
                    const num = parseFloat(val.replace(/,/g, ''));
                    if (!isNaN(num)) return Math.floor(num * scale).toLocaleString();
                }
                return val;
            };
            if (res.assetsKpis) res.assetsKpis = res.assetsKpis.map((k: any) => ({ ...k, value: scaleValLocal(k.value) }));
            if (res.assetTypes) res.assetTypes = res.assetTypes.map((c: any) => ({ ...c, value: scaleValLocal(c.value) }));
        }

        // 11. Training Provider Filter
        if (trainingProvider !== 'all') {
            const scale = 0.7;
            const scaleValLocal = (val: any) => {
                if (typeof val === 'number') return Math.floor(val * scale);
                if (typeof val === 'string' && !val.includes('%')) {
                    const num = parseFloat(val.replace(/,/g, ''));
                    if (!isNaN(num)) return Math.floor(num * scale).toLocaleString();
                }
                return val;
            };
            if (res.trainingKpis) res.trainingKpis = res.trainingKpis.map((k: any) => ({ ...k, value: scaleValLocal(k.value) }));
            if (res.topCourses) res.topCourses = res.topCourses.map((c: any) => ({ ...c, value: scaleValLocal(c.value) }));
        }



        // 3. Job Level Filter (Performance) - Mock
        if (jobLevel && jobLevel !== 'all') { // Check if jobLevel exists in scope
            const levelScale = 0.8;
            ['perfKpis', 'deptPerf', 'promotionReadiness'].forEach(key => {
                if (res[key]) res[key] = res[key].map((k: any) => ({ ...k, value: typeof k.value === 'number' ? Math.floor(k.value * levelScale) : k.value }));
            });
        }

        // 4. Location Filter (Payroll) - Mock
        if (location && location !== 'all') { // Check if location exists in scope
            const locScale = 0.9;
            ['payrollKpis', 'payrollTrend', 'overtimeByDept'].forEach(key => {
                if (res[key]) res[key] = res[key].map((k: any) => ({ ...k, value: typeof k.value === 'number' ? Math.floor(k.value * locScale) : k.value }));
            });
        }

        // 5. Recruiter Filter (Mock)
        if (recruiter !== 'all') {
            const modifier = recruiter === 'sarah' ? 1.1 : 0.9;
            if (res.recKpis) res.recKpis = res.recKpis.map((k: any) =>
                typeof k.value === 'number' ? { ...k, value: Math.floor(k.value * modifier) } : k
            );
            if (res.hiringFunnel) res.hiringFunnel = res.hiringFunnel.map((d: any) => ({ ...d, count: Math.floor(d.count * modifier) }));
            if (res.recruiterPerformance) res.recruiterPerformance = res.recruiterPerformance.filter((d: any) => d.label.toLowerCase().includes(recruiter));
        }

        // 4. Request Category Filter
        if (category !== 'all') {
            if (res.requestCategory) res.requestCategory = res.requestCategory.filter((c: any) => c.name.toLowerCase().includes(category) || category === 'all');
            // Mock impact on volume
            if (res.requestVolume) res.requestVolume = res.requestVolume.map((v: any) => ({ ...v, value: Math.floor(v.value * 0.4) }));
        }

        // 5. Request Priority Filter
        if (priority !== 'all') {
            // Mock: High priority means fewer but faster checks? Just scaling for demo.
            if (res.requestVolume) res.requestVolume = res.requestVolume.map((v: any) => ({ ...v, value: Math.floor(v.value * (priority === 'high' ? 0.2 : 0.5)) }));
        }

        // 6. Survey Filter
        if (survey !== 'all') {
            // Mock: Different survey periods show different sentiment trends
            if (res.sentimentTrend) res.sentimentTrend = res.sentimentTrend.map((t: any) => ({ ...t, value: Math.max(0, Math.min(100, t.value + (Math.random() * 20 - 10))) }));
        }

        // 7. Skill Category Filter (Mock)
        if (skillCategory !== 'all') {
            const scale = 0.6;
            const scaleValLocal = (val: any) => { // Rename to avoid conflict if any scope leak
                if (typeof val === 'number') return Math.floor(val * scale);
                if (typeof val === 'string' && !val.includes('%')) {
                    const num = parseFloat(val.replace(/,/g, ''));
                    if (!isNaN(num)) return Math.floor(num * scale).toLocaleString();
                }
                return val;
            };
            if (res.skillsKpis) res.skillsKpis = res.skillsKpis.map((k: any) => ({ ...k, value: scaleValLocal(k.value) }));
            if (res.proficiencyDist) res.proficiencyDist = res.proficiencyDist.map((c: any) => ({ ...c, value: scaleValLocal(c.value) }));
            if (res.skillHeatmap && res.skillHeatmap.matrix) {
                res.skillHeatmap.matrix = res.skillHeatmap.matrix.map((c: any) => ({ ...c, value: scaleValLocal(c.value) }));
            }
        }

        // 8. Asset Type Filter
        if (assetType !== 'all') {
            const scale = 0.4;
            const scaleValLocal = (val: any) => {
                if (typeof val === 'number') return Math.floor(val * scale);
                if (typeof val === 'string' && !val.includes('%')) {
                    const num = parseFloat(val.replace(/,/g, ''));
                    if (!isNaN(num)) return Math.floor(num * scale).toLocaleString();
                }
                return val;
            };
            if (res.assetsKpis) res.assetsKpis = res.assetsKpis.map((k: any) => ({ ...k, value: scaleValLocal(k.value) }));
            if (res.assetTypes) res.assetTypes = res.assetTypes.map((c: any) => ({ ...c, value: scaleValLocal(c.value) }));
        }

        // 9. Training Provider Filter
        if (trainingProvider !== 'all') {
            const scale = 0.7;
            const scaleValLocal = (val: any) => {
                if (typeof val === 'number') return Math.floor(val * scale);
                if (typeof val === 'string' && !val.includes('%')) {
                    const num = parseFloat(val.replace(/,/g, ''));
                    if (!isNaN(num)) return Math.floor(num * scale).toLocaleString();
                }
                return val;
            };
            if (res.trainingKpis) res.trainingKpis = res.trainingKpis.map((k: any) => ({ ...k, value: scaleValLocal(k.value) }));
            if (res.topCourses) res.topCourses = res.topCourses.map((c: any) => ({ ...c, value: scaleValLocal(c.value) }));
        }


        setFilteredData(res);
    }, [data, department, period, recruiter, category, priority, survey, jobLevel, location, skillCategory, assetType, trainingProvider]);

    // ALIASING FOR JSX COMPATIBILITY (Use filteredData if available, else empty defaults)
    const activeData = filteredData || data;

    const {
        // KPIs
        hrisKpis, recKpis, perfKpis, payrollKpis, sentimentKpis, requestKpis,
        lifeBalanceKpis, skillsKpis, trainingKpis, goalsKpis, assetsKpis,
        keyResults, wfhTrends, skillHeatmap, roiAnalysis, warrantyList,
        overtimeTrends, workPatterns, wellnessEngagement, burnoutRisk,
        skillAcquisition, skillSupplyDemand,

        // Charts
        headcountTrend: headcountTrendData,
        deptDistribution: departmentDistributionData,
        perfDistribution: performanceDistributionData,
        attritionTrend: attritionTrendData,
        hiringFunnel: hiringData,
        perfVsTenure: performanceData,
        compliance: complianceData,
        demographicsGender: genderData, demographicsAge: ageData,
        tenureDistribution: tenureData, absenteeismTrend: absenteeismData,

        recruiterPerformance: recruiterData, timeToFillRole: timeToFillData,
        costPerHireTrend: costPerHireData, qualityOfHireTrend: qualityOfHireData,

        sourceOfHire: sourceOfHireData,
        timeToHire: timeToHireData,
        pipelineStatus: currentPipelineData,
        rejectionReasons: rejectionReasonsData,
        appsVsHires: applicationsVsHiresData,

        talentMatrix: nineBoxData,
        deptPerf: deptPerformanceData,
        reviewProgress: reviewProgressData,
        successionPlanning: successionPlanningData,
        skillGap: skillGapData,
        trainingImpact: trainingImpactData,
        goalCompletion: goalCompletionData,

        promotionReadiness: promotionReadinessData, pipOutcomes: pipOutcomesData,
        managerBias: managerBiasData, highPerformerRetention: highPerformerRetentionData,

        payrollTrend: payrollTrendData,
        deptPayroll: deptPayrollData,
        salaryDist: salaryDistData,
        budgetVsActual: payrollBudgetVsActualData,
        compBreakdown: compensationComponentsData,

        genderPayGap: genderPayGapData, benefitsAdoption: benefitsAdoptionData,
        benefitsDistribution: benefitsDistributionData,
        costPerHeadTrend: costPerHeadTrendData, overtimeByDept: overtimeByDeptData,

        sentimentTrend: sentimentTrendData,
        sentimentCategory: sentimentCategoryData,
        deptSentiment: deptSentimentData,
        enpsDist: enpsDistData, sentimentTenure: sentimentTenureData,
        participationByDept: participationByDeptData,
        keyDrivers: keyDriversData, responseRate: responseRateData,
        providerSpend, certStatus, hoursByDept,

        requestVolume: requestVolumeData,
        requestCategory: requestCategoryData,
        slaCompliance: slaComplianceData,
        resolutionTime: resolutionTimeData, requestStatus: requestStatusData,
        agentPerf: agentPerfData, backlogTrend: backlogTrendData, ticketReopenRate: ticketReopenRateData,
        goalDistribution, goalHistory, goalTypes, teamGoalPerf, activeGoalsProgress,
        assetAgeDist, assetsByVendor, licenseUtilization, maintenanceCosts
    } = activeData;

    /* Loading spinner removed to allow partial rendering */

    // FORCE VISIBLE DATA for Debugging
    const formattedRejectionData = [
        { name: 'Salary', value: 45 },
        { name: 'Better Offer', value: 30 },
        { name: 'Commute', value: 20 },
        { name: 'Role', value: 15 },
        { name: 'Timing', value: 10 }
    ];

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
                    { id: 'requests', label: 'Request Analysis' },
                    { id: 'life_balance', label: 'Life Balance' },
                    { id: 'skills', label: 'Skills Analytics' },
                    { id: 'training', label: 'Employee Training' },
                    { id: 'goals', label: 'Employee Goals' },
                    { id: 'assets', label: 'Employee Assets' }
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
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                        <Select
                            className="w-48"
                            options={[
                                { value: 'ytd', label: 'Year to Date' },
                                { value: 'q2', label: 'Q2' },
                            ]}
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        />
                        <Select
                            className="w-48"
                            options={[
                                { value: 'all', label: 'All Locations' },
                                { value: 'ny', label: 'New York' },
                                { value: 'ldn', label: 'London' },
                                { value: 'remote', label: 'Remote' }
                            ]}
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                        <div style={{ marginLeft: 'auto' }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                <Download size={16} />
                                Export Payroll
                            </button>
                        </div>

                    </div>

                    <div className="metrics-grid">
                        {payrollKpis.map((kpi: any, i: number) => (
                            <Card key={i} className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">{kpi.label}</div>
                                    {kpi.icon && <span className="text-xs text-gray-400">{kpi.icon}</span>}
                                </div>
                                <div className="metric-value">{kpi.value}</div>
                                {kpi.trend_value && (
                                    <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {kpi.trend_direction === 'up' ? '↑' : '↓'} {kpi.trend_value} {kpi.trend_label}
                                    </div>
                                )}
                            </Card>
                        ))}
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
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Benefit Cost Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={benefitsDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="label"
                                        >
                                            {(benefitsDistributionData || []).map((entry: any, index: number) => (
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

                    <div className="charts-grid mt-6">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Benefits Adoption Rate</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={benefitsAdoptionData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={(value: any) => `${value}%`} />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40}>
                                            <LabelList dataKey="value" position="top" formatter={(value: any) => `${value}%`} />
                                            {benefitsAdoptionData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Cost per Head Trend</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={costPerHeadTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip formatter={(value: any) => `$${value}`} />
                                        <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="extra_value" stroke="#374151" strokeDasharray="5 5" name="Budget" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid mt-6">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Gender Pay Gap (Cents on Dollar)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={genderPayGapData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 1]} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <ReferenceLine y={1} stroke="#000" strokeDasharray="3 3" label="Equal Pay" />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                                            <LabelList dataKey="value" position="top" formatter={(value: any) => `$${value}`} />
                                            {(genderPayGapData || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Overtime Cost by Department</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={overtimeByDeptData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} formatter={(value: any) => `$${value}`} />
                                        <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={40}>
                                            <LabelList dataKey="value" position="top" />
                                            {(overtimeByDeptData || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
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
                        <Select
                            className="w-48"
                            options={[
                                { value: 'all', label: 'All Employment Types' },
                                { value: 'fulltime', label: 'Full-Time' },
                                { value: 'contract', label: 'Contract' },
                                { value: 'intern', label: 'Internship' }
                            ]}
                            value={employmentType}
                            onChange={(e) => setEmploymentType(e.target.value)}
                        />
                        <div style={{ marginLeft: 'auto' }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                <Download size={16} />
                                Export Report
                            </button>
                        </div>

                    </div>

                    <div className="metrics-grid">
                        {hrisKpis.map((kpi: any, i: number) => (
                            <Card key={i} className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">{kpi.label}</div>
                                    {kpi.icon && <span className="text-xs text-gray-400">{kpi.icon}</span>}
                                </div>
                                <div className="metric-value">{kpi.value}</div>
                                {kpi.trend_value && (
                                    <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {kpi.trend_direction === 'up' ? '↑' : '↓'} {kpi.trend_value} {kpi.trend_label}
                                    </div>
                                )}
                            </Card>
                        ))}
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
                                        <XAxis dataKey="period" tick={{ fontSize: 12 }} />
                                        <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} width={40} />
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
                                    <BarChart
                                        data={departmentDistributionData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="label"
                                            type="category"
                                            width={100}
                                            tick={{ fontSize: 11 }}
                                        />
                                        <Tooltip
                                            contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        />
                                        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                                            {departmentDistributionData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
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
                                        <XAxis type="number" dataKey="tenure" name="Tenure" unit=" yrs" domain={[0, 12]} />
                                        <YAxis type="number" dataKey="performance" name="Performance" domain={[0, 5]} />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                        <Scatter name="Employees" data={performanceData.map((d: any) => {
                                            const item = d?.data || d || {};
                                            return {
                                                ...item,
                                                performance: typeof item.performance === 'string' ? parseFloat(item.performance) : item.performance
                                            };
                                        })} fill="#8884d8">
                                            {performanceData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill="#3b82f6" />
                                            ))}
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Gender Diversity</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={genderData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="label"
                                        >
                                            {genderData.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Age Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={ageData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Tenure Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={tenureData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Absenteeism Rate Trend</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={absenteeismData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="value" stroke="#ef4444" fillOpacity={1} fill="url(#colorAbsent)" />
                                    </AreaChart>
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
                            {(complianceData || []).map((d: any, i: number) => {
                                if (!d) return null;
                                return (
                                    <div key={i} className="heatmap-row">
                                        <div className="heatmap-cell align-left font-medium">{d.dept || 'Unknown'}</div>
                                        <div className="heatmap-cell">
                                            <span className={`compliance-badge ${getBadgeClass(d.gdpr || 0)}`}>{d.gdpr || 0}%</span>
                                        </div>
                                        <div className="heatmap-cell">
                                            <span className={`compliance-badge ${getBadgeClass(d.conduct || 0)}`}>{d.conduct || 0}%</span>
                                        </div>
                                        <div className="heatmap-cell">
                                            <span className={`compliance-badge ${getBadgeClass(d.infosec || 0)}`}>{d.infosec || 0}%</span>
                                        </div>
                                    </div>
                                )
                            })}
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
                                    { value: 'engineering', label: 'Tech / Engineering' },
                                    { value: 'sales', label: 'Sales & Marketing' },
                                    { value: 'operations', label: 'Operations' },
                                    { value: 'hr', label: 'Human Resources' }
                                ]}
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                            <Select
                                className="w-48"
                                options={[
                                    { value: 'ytd', label: 'Year to Date' },
                                    { value: 'month', label: 'Last 30 Days' },
                                    { value: 'quarter', label: 'This Quarter' }
                                ]}
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                            />
                            <Select
                                className="w-48"
                                options={[
                                    { value: 'all', label: 'All Recruiters' },
                                    { value: 'sarah', label: 'Sarah J.' },
                                    { value: 'mike', label: 'Mike T.' }
                                ]}
                                value={recruiter}
                                onChange={(e) => setRecruiter(e.target.value)}
                            />
                            <div style={{ marginLeft: 'auto' }}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                    <Download size={16} />
                                    Export Candidates
                                </button>
                            </div>
                        </div>

                        <div className="metrics-grid">
                            <Card className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">Total Applicants</div>
                                    <Users size={16} className="text-gray-400" />
                                </div>
                                <div className="metric-value">{activeData.hiringFunnel?.[0]?.count || 850}</div>
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
                            <Card className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">Avg Cost per Hire</div>
                                    <DollarSign size={16} className="text-gray-400" />
                                </div>
                                <div className="metric-value">$4,250</div>
                                <div className="metric-trend text-red-600">↑ 5% vs last qtr</div>
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

                        <div className="charts-grid mt-6">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Offer Rejection Reasons</h3>
                                <div style={{ width: '100%', height: 300, overflow: 'hidden' }}>
                                    <BarChart
                                        width={500}
                                        height={300}
                                        data={activeData.rejectionReasons && activeData.rejectionReasons.length > 0 ? activeData.rejectionReasons : formattedRejectionData}
                                        layout="vertical"
                                        margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 11 }} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Quality of Hire Trend</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={qualityOfHireData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="period" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>



                        <div className="charts-grid mt-6">
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
                        </div>

                        <div className="charts-grid mt-6">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Recruiter Performance (Hires)</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={recruiterData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                            <YAxis />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Time to Fill by Role (Days)</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={timeToFillData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 11 }} />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>

                        <div className="charts-grid mt-6">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Cost per Hire Trend</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={costPerHireData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <Tooltip formatter={(value: any) => `$${Math.round(value)}`} />
                                            <Area type="monotone" dataKey="value" stroke="#ef4444" fillOpacity={1} fill="url(#colorCost)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Quality of Hire Score Trend</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={qualityOfHireData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="period" />
                                            <YAxis domain={[0, 100]} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
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
                                value={department}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                            <Select
                                className="w-48"
                                options={[
                                    { value: 'cy', label: 'Current Cycle' },
                                    { value: 'py', label: 'Previous Cycle' },
                                ]}
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                            />
                            <Select
                                className="w-48"
                                options={[
                                    { value: 'all', label: 'All Levels' },
                                    { value: 'junior', label: 'Junior / Associate' },
                                    { value: 'mid', label: 'Mid-Level' },
                                    { value: 'senior', label: 'Senior / Lead' },
                                    { value: 'exec', label: 'Executive' }
                                ]}
                                value={jobLevel}
                                onChange={(e) => setJobLevel(e.target.value)}
                            />
                            <div style={{ marginLeft: 'auto' }}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                    <Download size={16} />
                                    Export Analysis
                                </button>
                            </div>
                        </div>

                        <div className="metrics-grid">
                            {perfKpis.map((kpi: any, i: number) => (
                                <Card key={i} className="metric-card">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="metric-label">{kpi.label}</div>
                                        {kpi.icon && <span className="text-xs text-gray-400">{kpi.icon}</span>}
                                    </div>
                                    <div className="metric-value">{kpi.value}</div>
                                    {kpi.trend_value && (
                                        <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {kpi.trend_direction === 'up' ? '↑' : '↓'} {kpi.trend_value} {kpi.trend_label}
                                        </div>
                                    )}
                                </Card>
                            ))}
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
                                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                            <YAxis domain={[0, 5]} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            />
                                            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>



                        <div className="charts-grid mt-6">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Promotion Readiness</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={promotionReadinessData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {promotionReadinessData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">High Performer Retention Trend</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <LineChart data={highPerformerRetentionData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="period" />
                                            <YAxis domain={[90, 100]} />
                                            <Tooltip formatter={(value: any) => `${value}%`} />
                                            <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                            <Line type="monotone" dataKey="extra_value" stroke="#9ca3af" strokeDasharray="5 5" name="Target" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Succession Planning Status</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={successionPlanningData}
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                nameKey="label"
                                                label
                                            >
                                                {(successionPlanningData || []).map((entry: any, index: number) => (
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

                        <div className="charts-grid mt-6">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">PIP Outcomes</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={pipOutcomesData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                            <YAxis />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                            <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40}>
                                                {pipOutcomesData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Manager Rating Bias (Deviation)</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={managerBiasData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                            <YAxis />
                                            <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                            <ReferenceLine y={0} stroke="#000" />
                                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} barSize={40}>
                                                {managerBiasData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.value > 0 ? '#10b981' : (entry.value < -0.5 ? '#ef4444' : '#f59e0b')} />
                                                ))}
                                            </Bar>
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
                                                nameKey="label"
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
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                        />
                        <Select
                            className="w-48"
                            options={[
                                { value: 'q1', label: 'Q1 2024' },
                                { value: 'q2', label: 'Q2 2024' },
                            ]}
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                        />
                        <Select
                            className="w-48"
                            options={[
                                { value: 'all', label: 'All Surveys' },
                                { value: 'annual_2024', label: 'Annual 2024' },
                                { value: 'q1_pulse', label: 'Q1 Pulse' },
                            ]}
                            value={survey}
                            onChange={(e) => setSurvey(e.target.value)}
                        />
                        <div style={{ marginLeft: 'auto' }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                <Download size={16} />
                                Export Feedback
                            </button>
                        </div>
                    </div>

                    <div className="metrics-grid">
                        {sentimentKpis.map((kpi: any, i: number) => (
                            <Card key={i} className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">{kpi.label}</div>
                                    {kpi.icon && <span className="text-xs text-gray-400">{kpi.icon}</span>}
                                </div>
                                <div className="metric-value">{kpi.value}</div>
                                {kpi.trend_value && (
                                    <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {kpi.trend_direction === 'up' ? '↑' : '↓'} {kpi.trend_value} {kpi.trend_label}
                                    </div>
                                )}
                            </Card>
                        ))}
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

                    <div className="charts-grid pt-6">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">eNPS Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={enpsDistData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {(enpsDistData || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Sentiment by Tenure</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={sentimentTenureData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis domain={[0, 5]} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                                            <LabelList dataKey="value" position="top" />
                                            {(sentimentTenureData || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid pt-6">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Key Drivers Analysis (Impact)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={keyDriversData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" domain={[0, 10]} />
                                        <YAxis dataKey="label" type="category" width={80} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30}>
                                            <LabelList dataKey="value" position="right" />
                                            {(keyDriversData || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Participation by Dept (%)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={participationByDeptData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Response Rate">
                                            {(participationByDeptData || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Response Rate Trend</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={responseRateData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="period" />
                                        <YAxis domain={[0, 100]} />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip formatter={(value: any) => `${value}%`} />
                                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorResponse)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid pt-6">
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
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                        <Select
                            className="w-48"
                            options={[
                                { value: 'all', label: 'All Priorities' },
                                { value: 'high', label: 'High Priority' },
                                { value: 'medium', label: 'Medium Priority' },
                                { value: 'low', label: 'Low Priority' }
                            ]}
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        />
                        <div style={{ marginLeft: 'auto' }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                <Download size={16} />
                                Export Tickets
                            </button>
                        </div>
                    </div>

                    <div className="metrics-grid">
                        {(requestKpis || []).map((kpi: any, i: number) => (
                            <Card key={i} className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">{kpi.label}</div>
                                    {kpi.icon && <span className="text-xs text-gray-400">{kpi.icon}</span>}
                                </div>
                                <div className="metric-value">{kpi.value}</div>
                                {kpi.trend_value && (
                                    <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {kpi.trend_direction === 'up' ? '↑' : '↓'} {kpi.trend_value} {kpi.trend_label}
                                    </div>
                                )}
                            </Card>
                        ))}
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
                                            {(requestCategoryData || []).map((entry: any, index: number) => (
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

                    <div className="charts-grid pt-6">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Resolution Time Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={resolutionTimeData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                                            <LabelList dataKey="value" position="top" />
                                            {(resolutionTimeData || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Request Status Overview</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={requestStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="label"
                                        >
                                            {(requestStatusData || []).map((entry: any, index: number) => (
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

                    <div className="charts-grid pt-6">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Agent Performance (Resolved Tickets)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={agentPerfData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="label" type="category" width={80} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={30}>
                                            <LabelList dataKey="value" position="right" />
                                            {(agentPerfData || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Ticket Backlog Trend</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={backlogTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorBacklog" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="value" stroke="#ef4444" fillOpacity={1} fill="url(#colorBacklog)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Ticket Reopen Rate Trend (%)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={ticketReopenRateData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorReopen" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorReopen)" name="Rate %" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid pt-6">
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
            )
            }

            {activeTab === 'life_balance' && (
                <>
                    <div className="metrics-grid">
                        {(lifeBalanceKpis || []).map((kpi: any, i: number) => (
                            <Card key={i} className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">{kpi.label}</div>
                                    {kpi.icon && <span className="text-xs text-gray-400">{kpi.icon}</span>}
                                </div>
                                <div className="metric-value">{kpi.value}</div>
                                {kpi.trend && (
                                    <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {kpi.trend_direction === 'up' ? '↑' : '↓'} {kpi.trend} {kpi.trend_direction && !kpi.trend.includes('vs') && 'vs last month'}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                    <div className="charts-grid pt-6">
                        {/* Row 1: Existing Charts */}
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Leave Utilization Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={activeData.leaveUtilization} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 11 }} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30}>
                                            <LabelList dataKey="value" position="right" />
                                            {(activeData.leaveUtilization || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Work From Home Trends</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={wfhTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="period" />
                                        <YAxis domain={[0, 100]} />
                                        <Tooltip formatter={(value: any) => `${value}%`} />
                                        <Legend />
                                        <Line type="monotone" dataKey="value" name="Remote" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                        <Line type="monotone" dataKey="extra_value" name="Hybrid" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Row 2: New Charts (Overtime & Work Patterns) */}
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Overtime Trends (Hours)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={overtimeTrends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorOt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="value" stroke="#f59e0b" fillOpacity={1} fill="url(#colorOt)" name="OT Hours" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Daily Work Patterns (Avg Hours)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={workPatterns} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" fontSize={12} />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {(workPatterns || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>

                        {/* Row 3: Wellness & Burnout */}
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Wellness Program Engagement</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={wellnessEngagement}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {(wellnessEngagement || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Burnout Risk Index (Heatmap)</h3>
                            <div className="overflow-x-auto mt-4 custom-scrollbar" style={{ height: 260 }}>
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr>
                                            <th className="pb-2 text-gray-500">Department</th>
                                            <th className="pb-2 text-gray-500">Risk Level</th>
                                            <th className="pb-2 text-right text-gray-500">Employees High Risk</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {(burnoutRisk?.heatmap || []).map((item: any, i: number) => (
                                            <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 font-medium text-gray-700">{item.x}</td>
                                                <td className="py-3">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs ${item.y === 'High' ? 'bg-red-100 text-red-700' :
                                                        item.y === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                                            'bg-green-100 text-green-700'
                                                        }`}>
                                                        {item.y}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right font-bold text-gray-700">{item.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {activeTab === 'skills' && (
                <>
                    <div className="flex gap-4 mb-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                        <Select
                            className="w-48"
                            options={[
                                { value: 'all', label: 'All Categories' },
                                { value: 'technical', label: 'Technical Skills' },
                                { value: 'soft', label: 'Soft Skills' },
                                { value: 'leadership', label: 'Leadership' }
                            ]}
                            value={skillCategory}
                            onChange={(e) => setSkillCategory(e.target.value)}
                        />
                        <div style={{ marginLeft: 'auto' }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                <Download size={16} />
                                Export Skills Matrix
                            </button>
                        </div>
                    </div>

                    <div className="metrics-grid">
                        {(skillsKpis || []).map((kpi: any, i: number) => (
                            <Card key={i} className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">{kpi.label}</div>
                                    {kpi.icon && <span className="text-xs text-gray-400">{kpi.icon}</span>}
                                </div>
                                <div className="metric-value">{kpi.value}</div>
                                {kpi.trend && (
                                    <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {kpi.trend_direction === 'up' ? '↑' : '↓'} {kpi.trend}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                    <div className="charts-grid pt-6">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Proficiency Level Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={activeData.proficiencyDist || [{ label: 'Expert', value: 10 }, { label: 'Novice', value: 20 }]} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                                        <YAxis />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50}>
                                            {(activeData.proficiencyDist || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color || '#8b5cf6'} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Skill Matrix Heatmap</h3>
                            <div className="overflow-x-auto mt-4">
                                <table className="w-full text-sm text-left">
                                    <thead>
                                        <tr>
                                            <th className="pb-2 font-medium text-gray-500">Skill Area</th>
                                            <th className="pb-2 text-center text-gray-500">Entry</th>
                                            <th className="pb-2 text-center text-gray-500">Junior</th>
                                            <th className="pb-2 text-center text-gray-500">Mid</th>
                                            <th className="pb-2 text-center text-gray-500">Senior</th>
                                            <th className="pb-2 text-center text-gray-500">Expert</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* Use flatHeatmap or default if empty */}
                                        {(skillHeatmap?.matrix || [
                                            { name: 'Technical', entry: 5, junior: 8, mid: 12, senior: 6, expert: 3 },
                                            { name: 'Design', entry: 2, junior: 4, mid: 5, senior: 3, expert: 1 }
                                        ]).map((row: any, i: number) => (
                                            <tr key={i} className="border-t border-gray-100">
                                                <td className="py-3 font-medium text-gray-700">{row.name}</td>
                                                {['entry', 'junior', 'mid', 'senior', 'expert'].map((level) => (
                                                    <td key={level} className="py-2 text-center">
                                                        <div className="inline-block px-3 py-1 rounded text-xs" style={{
                                                            backgroundColor: (row[level] || 0) > 15 ? '#10b981' : (row[level] || 0) > 5 ? '#3b82f6' : '#f3f4f6',
                                                            color: (row[level] || 0) > 5 ? 'white' : '#6b7280'
                                                        }}>
                                                            {row[level] || 0}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* NEW SKILLS CHARTS */}
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">New Skills Acquired (Trend)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={skillAcquisition || [{ period: 'Jan', value: 10 }]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="value" name="New Verifications" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Skill Supply vs Demand</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillSupplyDemand?.radar || [
                                        { subject: 'React', A: 120, B: 110, fullMark: 150 },
                                        { subject: 'Python', A: 98, B: 130, fullMark: 150 },
                                        { subject: 'Figma', A: 86, B: 85, fullMark: 150 }
                                    ]}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 150]} />
                                        <Radar name="Supply (Talent)" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                                        <Radar name="Demand (Projects)" dataKey="B" stroke="#ef4444" fill="#ef4444" fillOpacity={0.5} />
                                        <Legend />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                </>
            )}

            {activeTab === 'training' && (
                <>
                    <div className="flex gap-4 mb-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                        <Select
                            className="w-48"
                            options={[
                                { value: 'all', label: 'All Providers' },
                                { value: 'udemy', label: 'Udemy' },
                                { value: 'pluralsight', label: 'Pluralsight' },
                                { value: 'internal', label: 'Internal' }
                            ]}
                            value={trainingProvider}
                            onChange={(e) => setTrainingProvider(e.target.value)}
                        />
                        <div style={{ marginLeft: 'auto' }}>
                            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                <Download size={16} />
                                Export Training Report
                            </button>
                        </div>
                    </div>

                    <div className="metrics-grid">
                        {(trainingKpis || []).map((kpi: any, i: number) => (
                            <Card key={i} className="metric-card">
                                <div className="flex justify-between items-start w-full">
                                    <div className="metric-label">{kpi.label}</div>
                                    {kpi.icon && <span className="text-xs text-gray-400">{kpi.icon}</span>}
                                </div>
                                <div className="metric-value">{kpi.value}</div>
                                {kpi.trend && (
                                    <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                        {kpi.trend_direction === 'up' ? '↑' : '↓'} {kpi.trend}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>

                    <div className="charts-grid pt-6">

                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Top Completed Courses</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={activeData.topCourses} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                        <XAxis type="number" />
                                        <YAxis dataKey="label" type="category" width={120} tick={{ fontSize: 11 }} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={30}>
                                            <LabelList dataKey="value" position="right" />
                                            {(activeData.topCourses || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Training ROI Analysis (Cost vs Rating)</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                {/* <ResponsiveContainer> */}
                                <ScatterChart width={500} height={300} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid />
                                    <XAxis type="number" dataKey="cost" name="Cost" unit="$" />
                                    <YAxis type="number" dataKey="rating" name="Rating" domain={[0, 5]} />
                                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                                    <Scatter name="Courses" data={roiAnalysis?.scatter || []} fill="#8884d8">
                                        {(roiAnalysis?.scatter || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={entry.rating > 4 ? '#10b981' : '#f59e0b'} />
                                        ))}
                                    </Scatter>
                                </ScatterChart>
                                {/* </ResponsiveContainer> */}
                            </div>
                        </Card>
                    </div>



                    {/* NEW: Provider Spend & Certifications */}
                    <div className="charts-grid pt-6">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Training Spend by Provider</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={providerSpend || [{ name: 'Udemy', value: 400 }]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="label"
                                        >
                                            {(providerSpend || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Certification Status</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={certStatus || [{ name: 'Certified', value: 60 }]}
                                            cx="50%"
                                            cy="50%"
                                            startAngle={180}
                                            endAngle={0}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="label"
                                        >
                                            {(certStatus || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                        <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="text-2xl font-bold text-gray-700">
                                            {(certStatus && certStatus.length > 0 && certStatus[0]?.value)
                                                ? Math.round((certStatus[0].value / (certStatus.reduce((a: any, b: any) => a + (b.value || 0), 0) || 1)) * 100)
                                                : 0}%
                                        </text>
                                        <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="text-sm text-gray-500">
                                            Certified
                                        </text>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Training Hours by Level</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={hoursByDept || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                            {(hoursByDept || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div >
                    <div className="charts-grid pt-6">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Impact on Performance</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <ComposedChart data={activeData.trainingImpact || []} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" type="category" scale="band" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="hours" name="Training Hours" fill="#3b82f6" barSize={30} radius={[4, 4, 0, 0]} />
                                        <Line yAxisId="right" type="monotone" dataKey="score" name="Perf Score" stroke="#ef4444" strokeWidth={2} />
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    <div className="charts-grid pt-6">
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Proficiency Distribution</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={activeData.proficiencyDist || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="label" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]} maxBarSize={50}>
                                            {(activeData.proficiencyDist || []).map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                        <Card className="chart-placeholder">
                            <h3 className="chart-title">Goal Status Breakdown</h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie
                                            data={activeData.goalStatus || []}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                            nameKey="label"
                                        >
                                            {(activeData.goalStatus || []).map((entry: any, index: number) => (
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
                </>
            )
            }

            {
                activeTab === 'goals' && (
                    <>
                        <div className="flex gap-4 mb-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                            <Select
                                className="w-48"
                                options={[
                                    { value: 'all', label: 'All Statuses' },
                                    { value: 'on_track', label: 'On Track' },
                                    { value: 'at_risk', label: 'At Risk' },
                                    { value: 'behind', label: 'Behind' }
                                ]}
                                value={priority} // Reusing priority state for Goal Status filter to avoid new state
                                onChange={(e) => setPriority(e.target.value)}
                            />
                            <div style={{ marginLeft: 'auto' }}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                    <Download size={16} />
                                    Export OKRs
                                </button>
                            </div>
                        </div>

                        <div className="metrics-grid">
                            {(goalsKpis || []).map((kpi: any, i: number) => (
                                <Card key={i} className="metric-card">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="metric-label">{kpi.label}</div>
                                        {kpi.icon && <span className="text-xs text-gray-400">{kpi.icon}</span>}
                                    </div>
                                    <div className="metric-value">{kpi.value}</div>
                                    {kpi.trend && (
                                        <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {kpi.trend_direction === 'up' ? '↑' : '↓'} {kpi.trend}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                        <div className="charts-grid pt-6">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Goal Status Distribution</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={activeData.goalStatus}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                nameKey="label"
                                            >
                                                {(activeData.goalStatus || []).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Active Goals Progress</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart layout="vertical" data={activeGoalsProgress || []} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis dataKey="label" type="category" width={100} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                                                {(activeGoalsProgress || []).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* ROW 2 */}
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Goals by Department</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={goalDistribution || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                nameKey="label"
                                            >
                                                {(goalDistribution || []).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Goal Completion History</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={goalHistory || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorGoalHistory" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorGoalHistory)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* ROW 3 */}
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Goal Type Distribution</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={goalTypes || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                                {(goalTypes || []).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Team Performance Leaderboard</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart layout="vertical" data={teamGoalPerf || []} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis dataKey="label" type="category" width={100} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                                                {(teamGoalPerf || []).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </>
                )
            }

            {
                activeTab === 'assets' && (
                    <>
                        <div className="flex gap-4 mb-6" style={{ marginBottom: 'var(--spacing-10)' }}>
                            <Select
                                className="w-48"
                                options={[
                                    { value: 'all', label: 'All Asset Types' },
                                    { value: 'laptop', label: 'Laptops' },
                                    { value: 'monitor', label: 'Monitors' },
                                    { value: 'license', label: 'Licenses' }
                                ]}
                                value={assetType}
                                onChange={(e) => setAssetType(e.target.value)}
                            />
                            <div style={{ marginLeft: 'auto' }}>
                                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700">
                                    <Download size={16} />
                                    Export Asset Inventory
                                </button>
                            </div>
                        </div>

                        <div className="metrics-grid">
                            {(assetsKpis || []).map((kpi: any, i: number) => (
                                <Card key={i} className="metric-card">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="metric-label">{kpi.label}</div>
                                        {kpi.icon && <span className="text-xs text-gray-400">{kpi.icon}</span>}
                                    </div>
                                    <div className="metric-value">{kpi.value}</div>
                                    {kpi.trend && (
                                        <div className={`metric-trend ${kpi.trend_direction === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {kpi.trend_direction === 'up' ? '↑' : '↓'} {kpi.trend}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                        <div className="charts-grid pt-6">
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Assets by Type</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={activeData.assetTypes} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" />
                                            <YAxis dataKey="label" type="category" width={100} tick={{ fontSize: 11 }} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={30}>
                                                <LabelList dataKey="value" position="right" />
                                                {(activeData.assetTypes || []).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Warranty Expiry & Maintenance</h3>
                                <div className="overflow-x-auto mt-4">
                                    <table className="w-full text-sm text-left">
                                        <thead>
                                            <tr>
                                                <th className="pb-2 text-gray-500">Asset</th>
                                                <th className="pb-2 text-gray-500">Serial/ID</th>
                                                <th className="pb-2 text-gray-500">Assigned To</th>
                                                <th className="pb-2 text-gray-500">Expiry Date</th>
                                                <th className="pb-2 text-right text-gray-500">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(warrantyList?.[0]?.data?.list || []).map((item: any, i: number) => (
                                                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 font-medium text-gray-700">{item.name}</td>
                                                    <td className="py-3 text-gray-500 text-xs">{item.serial}</td>
                                                    <td className="py-3 text-gray-600">{item.assignee}</td>
                                                    <td className="py-3 text-gray-500">{item.date}</td>
                                                    <td className="py-3 text-right">
                                                        <span className={`inline-block px-2 py-1 rounded text-xs ${item.status === 'Critical' ? 'bg-red-100 text-red-700' :
                                                            item.status === 'Warning' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-green-100 text-green-700'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>

                            {/* ROW 2 - NEW CHARTS */}
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Asset Age Distribution</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart data={assetAgeDist || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="label" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]}>
                                                {(assetAgeDist || []).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Assets by Vendor</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <PieChart>
                                            <Pie
                                                data={assetsByVendor || []}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                nameKey="label"
                                            >
                                                {(assetsByVendor || []).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>

                            {/* ROW 3 */}
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">License Utilization</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <BarChart layout="vertical" data={licenseUtilization || []} margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" domain={[0, 100]} />
                                            <YAxis dataKey="label" type="category" width={100} />
                                            <Tooltip />
                                            <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                                                {(licenseUtilization || []).map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                            <Card className="chart-placeholder">
                                <h3 className="chart-title">Maintenance Cost Trend</h3>
                                <div style={{ width: '100%', height: 300 }}>
                                    <ResponsiveContainer>
                                        <AreaChart data={maintenanceCosts || []} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorMaint" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="value" stroke="#ef4444" fillOpacity={1} fill="url(#colorMaint)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </Card>
                        </div>
                    </>
                )
            }
        </div >
    );
};


// Helper for badge styling
function getBadgeClass(score: number) {
    if (score >= 95) return 'badge-success';
    if (score >= 85) return 'badge-warning';
    return 'badge-danger';
}
