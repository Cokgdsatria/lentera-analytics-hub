import MetricsCard from '../features/analytics/components/MetricsCard';
import { useAnalyticsData } from '../features/analytics/hooks/useAnalyticsData';

function formatNumber(value, isLoading) {
    if (isLoading) return '...';
    return Number(value || 0).toLocaleString();
}

function buildTrendPath(points) {
    if (!points?.length) return 'M 20,180 L 480,180';
    const maxCount = Math.max(...points.map(point => point.count), 1);
    const step = points.length > 1 ? 460 / (points.length - 1) : 460;

    return points.map((point, index) => {
        const x = 20 + index * step;
        const y = 180 - (point.count / maxCount) * 145;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
}

function lastTrendPoint(points) {
    if (!points?.length) return { x: 480, y: 180 };
    const maxCount = Math.max(...points.map(point => point.count), 1);
    const step = points.length > 1 ? 460 / (points.length - 1) : 460;
    const index = points.length - 1;
    return {
        x: 20 + index * step,
        y: 180 - (points[index].count / maxCount) * 145,
    };
}

export default function DashboardPage() {
    const { data, isLoading, error } = useAnalyticsData();
    const path = buildTrendPath(data?.daily_trend);
    const peak = lastTrendPoint(data?.daily_trend);

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Monitoring Dashboard</h1>
                    <p className="text-xs md:text-sm text-slate-500 mt-1">Real-time overview of administrative grievances and resolution metrics.</p>
                </div>
                <div className="relative inline-block shrink-0">
                    <select className="appearance-none bg-white border border-slate-200 rounded-lg pl-10 pr-10 py-2.5 text-xs md:text-sm font-semibold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer shadow-xs">
                        <option>Last 30 Days</option>
                    </select>
                    <svg className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <svg className="w-4 h-4 absolute right-3.5 top-3.5 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-100 text-xs font-semibold text-red-600">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricsCard
                    title="Total Complaints" value={formatNumber(data?.total_complaints, isLoading)} trend="0" isTrendPositive={true}
                    iconBgColor="bg-blue-50" iconTextColor="text-blue-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
                />
                <MetricsCard
                    title="Pending Review" value={formatNumber(data?.pending_review, isLoading)} trend="0" isTrendPositive={false}
                    iconBgColor="bg-orange-50" iconTextColor="text-orange-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                />
                <MetricsCard
                    title="In Progress" value={formatNumber(data?.in_progress, isLoading)} trend="0" isTrendPositive={true}
                    iconBgColor="bg-indigo-50" iconTextColor="text-indigo-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                />
                <MetricsCard
                    title="Resolved" value={formatNumber(data?.resolved, isLoading)} trend="0" isTrendPositive={true}
                    iconBgColor="bg-emerald-50" iconTextColor="text-emerald-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base font-bold text-slate-800">Monthly Complaint Inflow Trend</h2>
                            <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Incoming complaints tracked daily over the last 30 days.</p>
                        </div>
                    </div>

                    <div className="flex-1 w-full min-h-[250px] relative mt-2 flex flex-col justify-between">
                        <svg viewBox="0 0 500 200" className="w-full h-full text-blue-600">
                            <line x1="20" y1="20" x2="480" y2="20" stroke="#f8fafc" strokeWidth="1.5" />
                            <line x1="20" y1="65" x2="480" y2="65" stroke="#f8fafc" strokeWidth="1.5" />
                            <line x1="20" y1="110" x2="480" y2="110" stroke="#f8fafc" strokeWidth="1.5" />
                            <line x1="20" y1="155" x2="480" y2="155" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4 4" />
                            <line x1="20" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />
                            <path d={`${path} L 480,180 L 20,180 Z`} fill="url(#chartGradient)" opacity="0.1" />
                            <path d={path} fill="none" stroke="#0052cc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx={peak.x} cy={peak.y} r="5" fill="#0052cc" />
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#0052cc" />
                                    <stop offset="100%" stopColor="#ffffff" />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-red-50 text-red-500 rounded-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </span>
                                <h2 className="text-sm font-bold text-slate-800">Recent Urgent</h2>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {data?.recent_urgent?.length ? data.recent_urgent.map((item) => (
                                <div key={item.id} className="p-4 rounded-lg border border-slate-100 bg-[#f8fafc]/50 hover:bg-[#f8fafc] transition-colors">
                                    <div className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded-sm uppercase tracking-wide">{item.urgency}</span>
                                        <span className="text-slate-400 font-semibold">{item.date}</span>
                                    </div>
                                    <h3 className="text-xs font-bold text-slate-700 leading-snug mt-2 line-clamp-2">
                                        {item.description}
                                    </h3>
                                    <div className="text-[10px] text-slate-400 font-bold mt-2 flex items-center gap-1">
                                        <span>#</span>
                                        <span>{item.id}</span>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-xs text-slate-400 font-semibold">No urgent complaints yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
