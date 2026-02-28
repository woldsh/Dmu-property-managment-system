'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
} from 'recharts';

// --- DATA ---
const requestTrendData = [
    { name: 'Mon', requests: 12 },
    { name: 'Tue', requests: 19 },
    { name: 'Wed', requests: 15 },
    { name: 'Thu', requests: 25 },
    { name: 'Fri', requests: 22 },
    { name: 'Sat', requests: 10 },
    { name: 'Sun', requests: 8 },
];

const departmentData = [
    { name: 'Mathematics', value: 45, color: '#2563eb' },
    { name: 'Physics', value: 32, color: '#4f46e5' },
    { name: 'IT', value: 28, color: '#0ea5e9' },
    { name: 'Chemistry', value: 22, color: '#06b6d4' },
    { name: 'Biology', value: 18, color: '#3b82f6' },
];

const statusData = [
    { name: 'Approved', value: 85, color: '#10b981' },
    { name: 'Pending', value: 12, color: '#f59e0b' },
    { name: 'Rejected', value: 3, color: '#ef4444' },
];

// --- CUSTOM TOOLTIP ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-slate-100 rounded-2xl shadow-xl">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black text-blue-600">
                    {payload[0].value} <span className="text-[10px] text-slate-500 uppercase">Requests</span>
                </p>
            </div>
        );
    }
    return null;
};

// --- COMPONENTS ---

interface DefaultChartProps {
    data?: any[];
}

export const RequestTrendChart = ({ data }: DefaultChartProps) => {
    const chartData = data || requestTrendData;
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }} />
                    <Area
                        type="monotone"
                        dataKey="requests"
                        stroke="#2563eb"
                        strokeWidth={4}
                        fillOpacity={1}
                        fill="url(#colorRequests)"
                        animationDuration={2000}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const DepartmentPieChart = ({ data }: DefaultChartProps) => {
    const chartData = data || departmentData;
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                        animationBegin={500}
                        animationDuration={1500}
                    >
                        {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        content={({ payload }) => {
                            if (payload && payload.length) {
                                return (
                                    <div className="bg-white p-3 border border-slate-100 rounded-2xl shadow-xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{payload[0].name}</p>
                                        <p className="text-lg font-black" style={{ color: payload[0].payload.color }}>{payload[0].value}% Distribution</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export const StatusBarChart = ({ data }: DefaultChartProps) => {
    const chartData = data || statusData;
    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 800 }}
                        dy={10}
                    />
                    <YAxis hide />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        content={({ payload }) => {
                            if (payload && payload.length) {
                                return (
                                    <div className="bg-white p-3 border border-slate-100 rounded-2xl shadow-xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{payload[0].name}</p>
                                        <p className="text-xl font-black" style={{ color: payload[0].payload.color }}>{payload[0].value}%</p>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />
                    <Bar
                        dataKey="value"
                        radius={[10, 10, 10, 10]}
                        barSize={40}
                        animationDuration={1500}
                    >
                        {chartData.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
