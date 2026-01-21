import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, LineChart, Line
} from 'recharts';
import { userService } from '../../services/userService';
import type { AppRole, AppUser } from '../../services/userService';
import { Shield, AlertTriangle, Users, Lock, TrendingUp, Activity, PieChart as PieChartIcon } from 'lucide-react';

export const RBACAnalytics: React.FC = () => {
    const [roles, setRoles] = useState<AppRole[]>([]);
    const [users, setUsers] = useState<AppUser[]>([]);

    const [roleDistData, setRoleDistData] = useState<any[]>([]);
    const [roleTypeData, setRoleTypeData] = useState<any[]>([]);
    const [highRiskUsers, setHighRiskUsers] = useState<AppUser[]>([]);
    const [riskByDeptData, setRiskByDeptData] = useState<any[]>([]);

    useEffect(() => {
        const load = async () => {
            const [r, u] = await Promise.all([
                userService.getRoles(),
                userService.getUsers()
            ]);
            setRoles(r);
            setUsers(u);

            const dist = r.map(role => {
                const count = u.filter(user => user.roles?.some((ur: AppRole) => ur.id === role.id)).length;
                return { name: role.name, count };
            }).sort((a, b) => b.count - a.count);
            setRoleDistData(dist);

            const sysCount = r.filter(x => x.is_system_role).length;
            const custCount = r.length - sysCount;
            setRoleTypeData([
                { name: 'System Roles', value: sysCount, color: '#6366f1' }, // Indigo-500
                { name: 'Custom Roles', value: custCount, color: '#10b981' } // Emerald-500
            ]);

            const risk = u.filter(user => user.roles?.some((ur: AppRole) => ur.name.toLowerCase().includes('admin')));
            setHighRiskUsers(risk);

            // Risk by Department Calculation
            const deptRisk = u.reduce((acc: any, user) => {
                if (!acc[user.department]) acc[user.department] = 0;
                if (user.roles?.some((ur: AppRole) => ur.name.toLowerCase().includes('admin'))) {
                    acc[user.department]++;
                }
                return acc;
            }, {});
            setRiskByDeptData(Object.keys(deptRisk).map(k => ({ name: k, count: deptRisk[k] })).sort((a, b) => b.count - a.count));
        };
        load();
    }, []);

    const auditData = [
        { day: 'Mon', changes: 4 },
        { day: 'Tue', changes: 7 },
        { day: 'Wed', changes: 2 },
        { day: 'Thu', changes: 12 },
        { day: 'Fri', changes: 5 },
        { day: 'Sat', changes: 3 },
        { day: 'Sun', changes: 0 },
    ];

    const inactiveCount = users.filter(u => u.status === 'inactive').length;
    const avgRoles = users.length ? (users.reduce((acc, u) => acc + (u.roles?.length || 0), 0) / users.length).toFixed(1) : 0;
    const uniqueDepts = new Set(users.map(u => u.department)).size;

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg text-sm">
                    <p className="font-semibold text-gray-800 mb-1">{label}</p>
                    <p className="text-indigo-600 font-medium">
                        {payload[0].name}: {payload[0].value}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-12">
            <div className="mb-4 text-xs text-gray-400 font-mono">Dashboard Layout v2.5 (High Spacing)</div>

            {/* KPI Grid (8 Cards) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem' }}>
                <Card className="items-center justify-between p-5 bg-white border-gray-100 shadow-sm flex hover:shadow-md transition-shadow group h-full">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Users</p>
                        <h3 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{users.length}</h3>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600 group-hover:scale-110 transition-transform">
                        <Users size={24} />
                    </div>
                </Card>

                <Card className="items-center justify-between p-5 bg-white border-gray-100 shadow-sm flex hover:shadow-md transition-shadow group h-full">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Active Roles</p>
                        <h3 className="text-3xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{roles.length}</h3>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-purple-600 group-hover:scale-110 transition-transform">
                        <Shield size={24} />
                    </div>
                </Card>

                <Card className="items-center justify-between p-5 bg-white border-gray-100 shadow-sm flex hover:shadow-md transition-shadow group h-full">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Privileged Accounts</p>
                        <h3 className="text-3xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">{highRiskUsers.length}</h3>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg text-orange-600 group-hover:scale-110 transition-transform">
                        <Lock size={24} />
                    </div>
                </Card>

                <Card className="items-center justify-between p-5 bg-white border-gray-100 shadow-sm flex hover:shadow-md transition-shadow group h-full">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Compliance Score</p>
                        <h3 className="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">98%</h3>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-green-600 group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                    </div>
                </Card>

                {/* Row 2 KPIs */}
                <Card className="items-center justify-between p-5 bg-white border-gray-100 shadow-sm flex hover:shadow-md transition-shadow group h-full">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Inactive Users</p>
                        <h3 className="text-3xl font-bold text-gray-900 group-hover:text-gray-600 transition-colors">{inactiveCount}</h3>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg text-gray-600 group-hover:scale-110 transition-transform">
                        <Users size={24} className="opacity-50" />
                    </div>
                </Card>

                <Card className="items-center justify-between p-5 bg-white border-gray-100 shadow-sm flex hover:shadow-md transition-shadow group h-full">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Departments</p>
                        <h3 className="text-3xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{uniqueDepts}</h3>
                    </div>
                    <div className="p-3 bg-teal-50 rounded-lg text-teal-600 group-hover:scale-110 transition-transform">
                        <Activity size={24} />
                    </div>
                </Card>

                <Card className="items-center justify-between p-5 bg-white border-gray-100 shadow-sm flex hover:shadow-md transition-shadow group h-full">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Avg Roles / User</p>
                        <h3 className="text-3xl font-bold text-gray-900 group-hover:text-cyan-600 transition-colors">{avgRoles}</h3>
                    </div>
                    <div className="p-3 bg-cyan-50 rounded-lg text-cyan-600 group-hover:scale-110 transition-transform">
                        <Shield size={24} />
                    </div>
                </Card>

                <Card className="items-center justify-between p-5 bg-white border-gray-100 shadow-sm flex hover:shadow-md transition-shadow group h-full">
                    <div>
                        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Pending Reviews</p>
                        <h3 className="text-3xl font-bold text-gray-900 group-hover:text-pink-600 transition-colors">5</h3>
                    </div>
                    <div className="p-3 bg-pink-50 rounded-lg text-pink-600 group-hover:scale-110 transition-transform">
                        <AlertTriangle size={24} />
                    </div>
                </Card>
            </div>

            {/* Row 3: User Dist + Dept Risk (Side by Side) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <Card className="p-6 bg-white border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">User Distribution</h3>
                            <p className="text-sm text-gray-500">Number of users assigned per role</p>
                        </div>
                        <div className="bg-indigo-50 p-2 rounded text-indigo-600">
                            <TrendingUp size={18} />
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer>
                            <BarChart data={roleDistData} layout="vertical" margin={{ left: 10, right: 30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 13, fill: '#6b7280', fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip cursor={{ fill: '#f9fafb' }} content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="#818cf8" radius={[0, 6, 6, 0]} barSize={24} background={{ fill: '#f9fafb' }} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Departmental Risk</h3>
                            <p className="text-sm text-gray-500">Admin accounts by department</p>
                        </div>
                        <div className="bg-red-50 p-2 rounded text-red-600">
                            <AlertTriangle size={18} />
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 320 }}>
                        <ResponsiveContainer>
                            <BarChart data={riskByDeptData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                                <YAxis hide />
                                <Tooltip cursor={{ fill: '#fef2f2' }} content={<CustomTooltip />} />
                                <Bar dataKey="count" fill="#f87171" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Row 4: Role Comp + Policy Change (Side by Side) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <Card className="p-6 bg-white border-gray-100 shadow-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Role Composition</h3>
                            <p className="text-sm text-gray-500">Ratio of System vs Custom roles</p>
                        </div>
                        <div className="bg-emerald-50 p-2 rounded text-emerald-600">
                            <PieChartIcon size={18} className="w-4 h-4" />
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 320 }} className="flex-1">
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={roleTypeData}
                                    cx="50%" cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={4}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {roleTypeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value, _entry: any) => <span className="text-sm font-medium text-gray-600 ml-2">{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="p-6 bg-white border-gray-100 shadow-sm h-full flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Policy Change Velocity</h3>
                        <p className="text-sm text-gray-500">Weekly trend of permission modifications</p>
                    </div>
                    <div style={{ width: '100%', height: 320 }} className="flex-1">
                        <ResponsiveContainer>
                            <LineChart data={auditData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 13, fill: '#9ca3af' }}
                                    dy={10}
                                />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="changes"
                                    stroke="#f59e0b"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#fff', stroke: '#f59e0b', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#f59e0b' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Row 5: Security Alerts (Full Width) */}
            <Card className="bg-red-50 border-red-100 p-6">
                <div className="flex items-center gap-3 mb-4 text-red-700">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                        <AlertTriangle size={20} />
                    </div>
                    <h3 className="font-bold text-lg">Security Alerts</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {highRiskUsers.length > 0 ? (
                        highRiskUsers.map(u => (
                            <div key={u.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-red-100">
                                <div>
                                    <div className="font-semibold text-gray-800 text-sm">{u.full_name}</div>
                                    <div className="text-xs text-gray-500">{u.email}</div>
                                </div>
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] font-bold uppercase tracking-wide">Admin</span>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-gray-400 text-sm italic py-4 text-center">No high-risk accounts detected.</div>
                    )}
                </div>

                <div className="mt-6 pt-4 border-t border-red-100">
                    <button className="w-full sm:w-auto px-6 py-2 bg-white text-red-600 text-sm font-medium rounded-lg hover:bg-red-600 hover:text-white transition-colors border border-red-200">
                        View Full Audit Log
                    </button>
                </div>
            </Card>
        </div>
    );
};
