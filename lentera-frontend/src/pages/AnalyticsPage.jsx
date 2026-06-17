import { useEffect, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { useAnalyticsData } from '../features/analytics/hooks/useAnalyticsData';
import { complaintApi } from '../services/api';

const DONUT_COLORS = ['#0038A8', '#1D4ED8', '#93C5FD', '#CBD5E1', '#60A5FA', '#2563EB'];

function formatNumber(value) {
    return Number(value || 0).toLocaleString();
}

function buildPieData(items, maxSlices = 6) {
    const sorted = [...(items || [])].sort((a, b) => (b.value || 0) - (a.value || 0));
    const top = sorted.slice(0, maxSlices);
    const rest = sorted.slice(maxSlices);
    const restTotal = rest.reduce((sum, item) => sum + (item.value || 0), 0);
    if (restTotal <= 0) return top;
    return [...top, { name: 'Other', value: restTotal }];
}

function toPercent(value, total) {
    if (!total) return 0;
    return Math.round((Number(value || 0) / total) * 100);
}

function urgencyLabel(value) {
    switch (value) {
        case 'High': return 'Tinggi';
        case 'Medium': return 'Sedang';
        case 'Low': return 'Rendah';
        default: return value || '-';
    }
}

function urgencyBarColor(value) {
    switch (value) {
        case 'High': return 'bg-blue-800';
        case 'Medium': return 'bg-blue-600';
        case 'Low': return 'bg-blue-200';
        default: return 'bg-slate-300';
    }
}

export default function AnalyticsPage() {
    const { data, isLoading, error } = useAnalyticsData();
    const [search, setSearch] = useState('');
    const [topCompanies, setTopCompanies] = useState([]);
    const [isCompanyLoading, setIsCompanyLoading] = useState(true);
    const [companyError, setCompanyError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadTopCompanies() {
            setIsCompanyLoading(true);
            setCompanyError(null);
            try {
                const limit = 100;
                let skip = 0;
                let total = Infinity;
                const all = [];

                for (let page = 0; page < 20 && skip < total; page += 1) {
                    const response = await complaintApi.list({ skip, limit });
                    total = Number(response?.total || 0);
                    const items = response?.items || [];
                    all.push(...items);
                    skip += limit;
                    if (!items.length) break;
                }

                const counts = new Map();
                for (const item of all) {
                    const name = String(item?.company_name || '').trim() || 'Unknown';
                    counts.set(name, (counts.get(name) || 0) + 1);
                }

                const ranked = [...counts.entries()]
                    .map(([name, value]) => ({ name, value }))
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 6);

                if (isMounted) setTopCompanies(ranked);
            } catch (err) {
                if (isMounted) setCompanyError(err.message || 'Gagal memuat performa perusahaan.');
            } finally {
                if (isMounted) setIsCompanyLoading(false);
            }
        }

        loadTopCompanies();
        return () => { isMounted = false; };
    }, []);

    const categoryDistribution = useMemo(() => data?.category_distribution || [], [data]);
    const urgencyDistribution = useMemo(() => data?.urgency_distribution || [], [data]);
    const totalCases = useMemo(
        () => categoryDistribution.reduce((sum, item) => sum + (item.value || 0), 0),
        [categoryDistribution],
    );
    const pieData = useMemo(
        () => buildPieData(categoryDistribution, 5),
        [categoryDistribution],
    );
    const categoryLegend = useMemo(() => {
        const sorted = [...categoryDistribution].sort((a, b) => (b.value || 0) - (a.value || 0));
        return sorted.slice(0, 4).map((item) => ({
            name: item.name,
            percent: toPercent(item.value, totalCases),
        }));
    }, [categoryDistribution, totalCases]);

    const urgencyTotal = useMemo(
        () => urgencyDistribution.reduce((sum, item) => sum + (item.value || 0), 0),
        [urgencyDistribution],
    );

    const filteredCompanies = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return topCompanies.slice(0, 4);
        return topCompanies.filter((company) => company.name.toLowerCase().includes(term)).slice(0, 4);
    }, [search, topCompanies]);
    const maxCompanyValue = Math.max(...filteredCompanies.map((item) => item.value), 1);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <svg className="w-4 h-4 absolute left-3 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m1.85-5.65a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search analytics..."
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                    />
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Deep Analysis & Analytics Report</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Comprehensive overview of grievance metrics and resolution trends.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-all shadow-xs shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M6 19h12a2 2 0 002-2v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2zM6 7V5a2 2 0 012-2h8a2 2 0 012 2v2" />
                    </svg>
                    Export PDF
                </button>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 text-xs font-semibold text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            {isLoading ? (
                <div className="bg-white rounded-xl border border-slate-200 p-10 text-center text-sm font-semibold text-slate-400">
                    Loading analytics...
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800">Complaints by Category</h2>
                            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                                <div className="relative h-56 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius={58}
                                                outerRadius={88}
                                                stroke="transparent"
                                                paddingAngle={2}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell key={`${entry.name}-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                                                ))}
                                            </Pie>
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <div className="text-3xl font-bold text-slate-900">{formatNumber(totalCases)}</div>
                                        <div className="text-xs font-semibold text-slate-400">Total Cases</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    {categoryLegend.map((item, index) => (
                                        <div key={item.name} className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length] }} />
                                                <span className="font-semibold text-slate-700 truncate">{item.name}</span>
                                            </div>
                                            <span className="font-bold text-slate-600">{item.percent}%</span>
                                        </div>
                                    ))}
                                    {!categoryLegend.length && (
                                        <div className="col-span-2 text-xs font-semibold text-slate-400">No data available.</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                            <h2 className="text-sm font-bold text-slate-800">Urgensi Komplain</h2>
                            <div className="mt-4 space-y-4">
                                {urgencyDistribution.map((item) => {
                                    const percent = toPercent(item.value, urgencyTotal);
                                    return (
                                        <div key={item.name}>
                                            <div className="flex items-center justify-between text-xs font-semibold mb-2">
                                                <span className="text-slate-700">{urgencyLabel(item.name)}</span>
                                                <span className="text-blue-700 font-bold">{percent}%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${urgencyBarColor(item.name)}`}
                                                    style={{ width: `${Math.max(4, percent)}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {!urgencyDistribution.length && (
                                    <p className="text-xs text-slate-400 font-semibold">No data available.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                        <h2 className="text-sm font-bold text-slate-800">Performa Perusahaan (Komplain Terbanyak)</h2>
                        {companyError && (
                            <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 text-xs font-semibold text-red-600 rounded-lg">
                                {companyError}
                            </div>
                        )}
                        {isCompanyLoading ? (
                            <div className="mt-4 text-xs font-semibold text-slate-400">Loading company performance...</div>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {filteredCompanies.map((item) => (
                                    <div key={item.name} className="grid grid-cols-[160px_1fr_44px] sm:grid-cols-[220px_1fr_56px] gap-4 items-center">
                                        <div className="text-xs font-semibold text-slate-700 truncate">{item.name}</div>
                                        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-700 rounded-full"
                                                style={{ width: `${Math.max(6, (item.value / maxCompanyValue) * 100)}%` }}
                                            />
                                        </div>
                                        <div className="text-xs font-bold text-slate-600 text-right tabular-nums">{formatNumber(item.value)}</div>
                                    </div>
                                ))}
                                {!filteredCompanies.length && (
                                    <div className="text-xs font-semibold text-slate-400">No company data available.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
