import { useAnalyticsData } from '../features/analytics/hooks/useAnalyticsData';

function DistributionBlock({ title, items }) {
    const maxValue = Math.max(...(items || []).map(item => item.value), 1);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-base font-bold text-slate-800 mb-4">{title}</h2>
            <div className="space-y-3">
                {(items || []).map((item) => (
                    <div key={item.name}>
                        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                            <span className="text-slate-600">{item.name}</span>
                            <span className="text-slate-400">{item.value}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{ width: `${Math.max(4, (item.value / maxValue) * 100)}%` }}
                            />
                        </div>
                    </div>
                ))}
                {!items?.length && (
                    <p className="text-xs text-slate-400 font-semibold">No data available.</p>
                )}
            </div>
        </div>
    );
}

export default function AnalyticsPage() {
    const { data, isLoading, error } = useAnalyticsData();

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Complaint Analytics</h1>
                <p className="text-xs text-slate-400 font-medium mt-1">
                    Distribution of complaint categories, urgency, and sentiment from backend inference.
                </p>
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
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <DistributionBlock title="Urgency" items={data?.urgency_distribution} />
                    <DistributionBlock title="Sentiment" items={data?.sentiment_distribution} />
                    <DistributionBlock title="Category" items={data?.category_distribution} />
                </div>
            )}
        </div>
    );
}
