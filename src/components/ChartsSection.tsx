import React, { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { CashFlowSummary } from '../types/cashflow';
import { BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';

interface ChartsSectionProps {
  summary: CashFlowSummary;
}

const DONUT_COLORS = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#10b981', // Emerald
  '#64748b', // Slate
  '#e11d48', // Rose
  '#a855f7', // Purple
  '#84cc16', // Lime
];

export const ChartsSection: React.FC<ChartsSectionProps> = ({ summary }) => {
  const [activeTab, setActiveTab] = useState<'all' | 'bars' | 'distribution' | 'trend'>('all');

  // Chart 1 Data: Bar Chart (Income vs Expenses vs Net Cash)
  const barData = [
    {
      name: 'Total Income',
      amount: summary.totalIncome,
      color: '#10b981', // Emerald
    },
    {
      name: 'Total Expenses',
      amount: summary.totalExpenses,
      color: '#f43f5e', // Rose
    },
    {
      name: summary.netCashMovement >= 0 ? 'Net Surplus' : 'Net Deficit',
      amount: Math.abs(summary.netCashMovement),
      color: summary.netCashMovement >= 0 ? '#0284c7' : '#e11d48',
    },
  ];

  // Chart 2 Data: Expense Donut
  const expenseCategories = summary.categoryBreakdown
    .filter((c) => c.type === 'Expense' && c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  // Group smaller categories into "Other / Misc" if more than 6 to keep donut legible
  let pieData: { name: string; value: number; percentage: number }[] = [];
  if (expenseCategories.length <= 6) {
    pieData = expenseCategories.map((c) => ({
      name: c.category,
      value: c.amount,
      percentage: c.percentage,
    }));
  } else {
    const top5 = expenseCategories.slice(0, 5);
    const others = expenseCategories.slice(5);
    const otherTotal = others.reduce((acc, curr) => acc + curr.amount, 0);
    const otherPct = others.reduce((acc, curr) => acc + curr.percentage, 0);

    pieData = [
      ...top5.map((c) => ({
        name: c.category,
        value: c.amount,
        percentage: c.percentage,
      })),
      {
        name: 'Other Categories',
        value: otherTotal,
        percentage: otherPct,
      },
    ];
  }

  // Chart 3 Data: Running Cash Balance Trend
  const trendData = summary.trend;

  // Custom Currency Tooltip
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs">
          <p className="font-semibold text-slate-300">{data.name}</p>
          <p className="text-base font-extrabold text-white mt-0.5">
            ₹{data.amount.toLocaleString('en-IN')}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs">
          <p className="font-semibold text-slate-300">{data.name}</p>
          <p className="text-base font-extrabold text-white mt-0.5">
            ₹{Number(data.value).toLocaleString('en-IN')} ({data.payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomTrendTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs">
          <p className="font-semibold text-slate-300">Date: {data.displayDate}</p>
          <p className="text-base font-extrabold text-blue-400 mt-0.5">
            Running Cash: ₹{Number(data.cumulativeCash).toLocaleString('en-IN')}
          </p>
          <div className="mt-1 pt-1 border-t border-slate-700/60 text-[11px] text-slate-400">
            Day In: ₹{data.income.toLocaleString('en-IN')} | Day Out: ₹{data.expenses.toLocaleString('en-IN')}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Visual Cash-Flow Analytics</h2>
          <p className="text-xs text-slate-500">
            Interactive breakdown of inflows, outflows, category concentration, and cash trajectory
          </p>
        </div>
      </div>

      {/* Grid of 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CHART 1: Income vs Expenses */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">1. Income vs Expenses</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Monthly Inflow/Outflow</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-around text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Inflow: ₹{summary.totalIncome.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Outflow: ₹{summary.totalExpenses.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* CHART 2: Expense Distribution Donut */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                <PieChartIcon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">2. Expense Distribution</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Category Share</span>
          </div>

          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip />} />
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_entry, index) => (
                    <Cell
                      key={`pie-cell-${index}`}
                      fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Total Spent</span>
              <span className="text-sm font-extrabold text-slate-800">
                ₹{summary.totalExpenses.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Mini Legend */}
          <div className="mt-2 pt-2 border-t border-slate-100 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-slate-600 max-h-20 overflow-y-auto">
            {pieData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                />
                <span className="truncate">{item.name}</span>
                <span className="font-bold text-slate-800 ml-auto shrink-0">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 3: Cash-flow Trend Line Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <LineChartIcon className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-800">3. Cash-flow Trend</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Running Balance</span>
          </div>

          <div className="h-64 w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="displayDate"
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                  />
                  <Tooltip content={<CustomTrendTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="cumulativeCash"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 2.5, fill: '#2563eb' }}
                    activeDot={{ r: 5, fill: '#1d4ed8' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No chronological dates found in transactions
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Cumulative cash movement</span>
            <span className="font-semibold text-blue-700">
              {summary.closingBalance !== null
                ? `Ending Cash: ₹${summary.closingBalance.toLocaleString('en-IN')}`
                : `Net Shift: ₹${summary.netCashMovement.toLocaleString('en-IN')}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
