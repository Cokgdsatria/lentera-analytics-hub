import MetricsCard from '../features/analytics/components/MetricsCard';
import { useAnalyticsData } from '../features/analytics/hooks/useAnalyticsData';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function formatNumber(value, isLoading) {
    if (isLoading) return '...';
    return Number(value || 0).toLocaleString();
}

function parseIsoDate(isoDate) {
    if (!isoDate) return null;
    const date = new Date(`${isoDate}T00:00:00Z`);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatHoverDate(isoDate) {
    const date = parseIsoDate(isoDate);
    if (!date) return isoDate || '-';
    return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(date);
}

function formatAxisDate(isoDate) {
    const date = parseIsoDate(isoDate);
    if (!date) return isoDate || '';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(date);
}

function niceCeil(value) {
    const numeric = Number(value || 0);
    if (!Number.isFinite(numeric) || numeric <= 0) return 0;
    const exponent = Math.floor(Math.log10(numeric));
    const magnitude = 10 ** exponent;
    const fraction = numeric / magnitude;
    const niceFraction = fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10;
    return niceFraction * magnitude;
}

function buildTrendScale(points) {
    const maxCount = Math.max(...(points || []).map((point) => point.count || 0), 0);
    const baseMax = Math.max(1, maxCount);
    const initialMax = niceCeil(baseMax);
    const step = Math.max(1, niceCeil(initialMax / 4));
    const yMax = step * 4;
    return { yMax, step };
}

function toTrendY(value, yMax) {
    const maxValue = Math.max(1, yMax || 1);
    return 180 - (Number(value || 0) / maxValue) * 145;
}

function buildTrendPath(points, yMax) {
    if (!points?.length) return 'M 20,180 L 480,180';
    const step = points.length > 1 ? 460 / (points.length - 1) : 460;

    return points.map((point, index) => {
        const x = 20 + index * step;
        const y = toTrendY(point.count, yMax);
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(' ');
}

function buildTrendPoints(points, yMax) {
    if (!points?.length) return [];
    const step = points.length > 1 ? 460 / (points.length - 1) : 460;

    return points.map((point, index) => {
        const x = 20 + index * step;
        const y = toTrendY(point.count, yMax);
        return {
            x,
            y,
            date: point.date,
            count: point.count,
        };
    });
}

function readPreviousMetrics() {
    try {
        const raw = localStorage.getItem('lentera_dashboard_metrics_prev');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed;
    } catch {
        return null;
    }
}

function percentChange(previous, current) {
    const prev = Number(previous);
    const cur = Number(current);
    if (!Number.isFinite(prev) || !Number.isFinite(cur) || prev <= 0) return 0;
    return ((cur - prev) / prev) * 100;
}

function lastTrendPoint(points, yMax) {
    if (!points?.length) return { x: 480, y: 180 };
    const step = points.length > 1 ? 460 / (points.length - 1) : 460;
    const index = points.length - 1;
    return {
        x: 20 + index * step,
        y: toTrendY(points[index].count, yMax),
    };
}

export default function DashboardPage() {
    const navigate = useNavigate();
    const { data, isLoading, error } = useAnalyticsData();
    const scale = useMemo(() => buildTrendScale(data?.daily_trend), [data?.daily_trend]);
    const path = useMemo(() => buildTrendPath(data?.daily_trend, scale.yMax), [data?.daily_trend, scale.yMax]);
    const peak = useMemo(() => lastTrendPoint(data?.daily_trend, scale.yMax), [data?.daily_trend, scale.yMax]);
    const trendPoints = useMemo(() => buildTrendPoints(data?.daily_trend, scale.yMax), [data?.daily_trend, scale.yMax]);
    const trendStep = trendPoints.length > 1 ? 460 / (trendPoints.length - 1) : 460;
    const [hoverIndex, setHoverIndex] = useState(null);
    const hover = hoverIndex !== null ? trendPoints[hoverIndex] : null;
    const hoverLabel = hover ? formatHoverDate(hover.date) : '';
    const tooltipLeft = hover ? Math.min(92, Math.max(8, (hover.x / 500) * 100)) : 0;
    const yTicks = useMemo(() => (
        [0, scale.step, scale.step * 2, scale.step * 3, scale.step * 4]
    ), [scale.step]);
    const xTickIndices = useMemo(() => {
        const length = trendPoints.length;
        if (length <= 1) return [];
        const ticks = [];
        for (let i = 0; i < length; i += 5) ticks.push(i);
        const last = length - 1;
        if (!ticks.includes(last) && last - ticks[ticks.length - 1] >= 3) ticks.push(last);
        return ticks;
    }, [trendPoints.length]);

    const handleTrendMove = (event) => {
        if (!trendPoints.length) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const ratio = rect.width ? (event.clientX - rect.left) / rect.width : 0;
        const x = ratio * 500;
        const clampedX = Math.max(20, Math.min(480, x));
        const raw = (clampedX - 20) / trendStep;
        const index = Math.max(0, Math.min(trendPoints.length - 1, Math.round(raw)));
        setHoverIndex(index);
    };

    const previousMetrics = useMemo(() => readPreviousMetrics(), []);
    const currentMetrics = useMemo(() => ({
        total_complaints: Number(data?.total_complaints || 0),
        pending_review: Number(data?.pending_review || 0),
        in_progress: Number(data?.in_progress || 0),
        resolved: Number(data?.resolved || 0),
    }), [data]);

    const trendSummary = useMemo(() => {
        const prev = previousMetrics || {};
        const deltaTotal = percentChange(prev.total_complaints, currentMetrics.total_complaints);
        const deltaPending = percentChange(prev.pending_review, currentMetrics.pending_review);
        const deltaInProgress = percentChange(prev.in_progress, currentMetrics.in_progress);
        const deltaResolved = percentChange(prev.resolved, currentMetrics.resolved);

        return {
            total: {
                value: Math.round(Math.abs(deltaTotal)),
                isPositive: deltaTotal >= 0,
            },
            pending: {
                value: Math.round(Math.abs(deltaPending)),
                isPositive: deltaPending <= 0,
            },
            inProgress: {
                value: Math.round(Math.abs(deltaInProgress)),
                isPositive: deltaInProgress >= 0,
            },
            resolved: {
                value: Math.round(Math.abs(deltaResolved)),
                isPositive: deltaResolved >= 0,
            },
        };
    }, [previousMetrics, currentMetrics]);

    useEffect(() => {
        if (isLoading || error || !data) return;
        try {
            localStorage.setItem('lentera_dashboard_metrics_prev', JSON.stringify({
                ...currentMetrics,
                stored_at: new Date().toISOString(),
            }));
        } catch {
        }
    }, [isLoading, error, data, currentMetrics]);

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
                    title="Total Complaints"
                    value={formatNumber(data?.total_complaints, isLoading)}
                    trend={String(trendSummary.total.value)}
                    isTrendPositive={trendSummary.total.isPositive}
                    iconBgColor="bg-blue-50" iconTextColor="text-blue-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>}
                />
                <MetricsCard
                    title="Pending Review"
                    value={formatNumber(data?.pending_review, isLoading)}
                    trend={String(trendSummary.pending.value)}
                    isTrendPositive={trendSummary.pending.isPositive}
                    iconBgColor="bg-orange-50" iconTextColor="text-orange-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                />
                <MetricsCard
                    title="In Progress"
                    value={formatNumber(data?.in_progress, isLoading)}
                    trend={String(trendSummary.inProgress.value)}
                    isTrendPositive={trendSummary.inProgress.isPositive}
                    iconBgColor="bg-indigo-50" iconTextColor="text-indigo-600"
                    icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                />
                <MetricsCard
                    title="Resolved"
                    value={formatNumber(data?.resolved, isLoading)}
                    trend={String(trendSummary.resolved.value)}
                    isTrendPositive={trendSummary.resolved.isPositive}
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
                        {hover && (
                            <div
                                className="absolute top-3 z-10 pointer-events-none"
                                style={{ left: `${tooltipLeft}%`, transform: 'translateX(-50%)' }}
                            >
                                <div className="bg-slate-900/90 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm whitespace-nowrap">
                                    <span className="font-bold tabular-nums">{hover.count}</span>
                                    <span className="text-slate-200"> keluhan</span>
                                    <span className="text-slate-300"> · </span>
                                    <span className="text-slate-200">{hoverLabel}</span>
                                </div>
                            </div>
                        )}
                        <svg
                            viewBox="0 0 500 200"
                            className="w-full h-full text-blue-600"
                            onMouseMove={handleTrendMove}
                            onMouseLeave={() => setHoverIndex(null)}
                        >
                            <line x1="20" y1="20" x2="480" y2="20" stroke="#f8fafc" strokeWidth="1.5" />
                            <line x1="20" y1="65" x2="480" y2="65" stroke="#f8fafc" strokeWidth="1.5" />
                            <line x1="20" y1="110" x2="480" y2="110" stroke="#f8fafc" strokeWidth="1.5" />
                            <line x1="20" y1="155" x2="480" y2="155" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4 4" />
                            <line x1="20" y1="180" x2="480" y2="180" stroke="#e2e8f0" strokeWidth="1.5" />
                            {yTicks.map((tick) => {
                                const y = toTrendY(tick, scale.yMax);
                                return (
                                    <text
                                        key={tick}
                                        x="18"
                                        y={y + 4}
                                        fontSize="10"
                                        fontWeight="600"
                                        textAnchor="end"
                                        fill="#94a3b8"
                                    >
                                        {formatNumber(tick, false)}
                                    </text>
                                );
                            })}
                            {xTickIndices.map((index) => {
                                const point = trendPoints[index];
                                if (!point) return null;
                                const x = point.x;
                                const label = formatAxisDate(point.date);
                                return (
                                    <text
                                        key={point.date}
                                        x={x}
                                        y="196"
                                        fontSize="10"
                                        fontWeight="600"
                                        textAnchor="middle"
                                        fill="#94a3b8"
                                    >
                                        {label}
                                    </text>
                                );
                            })}
                            {hover && (
                                <line
                                    x1={hover.x}
                                    y1="20"
                                    x2={hover.x}
                                    y2="180"
                                    stroke="#94a3b8"
                                    strokeWidth="1.5"
                                    strokeDasharray="2 4"
                                />
                            )}
                            <path d={`${path} L 480,180 L 20,180 Z`} fill="url(#chartGradient)" opacity="0.1" />
                            <path d={path} fill="none" stroke="#0052cc" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            {hover ? (
                                <>
                                    <circle cx={hover.x} cy={hover.y} r="6" fill="#0052cc" />
                                    <circle cx={hover.x} cy={hover.y} r="10" fill="#0052cc" opacity="0.12" />
                                </>
                            ) : (
                                <circle cx={peak.x} cy={peak.y} r="5" fill="#0052cc" />
                            )}
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
                            {data?.recent_urgent?.length ? data.recent_urgent.slice(0, 3).map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => navigate(`/admin/complaints/${item.id}`)}
                                    className="w-full text-left p-4 rounded-lg border border-slate-100 bg-[#f8fafc]/50 hover:bg-[#f8fafc] transition-colors cursor-pointer"
                                >
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
                                </button>
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
