export default function MetricsCard({ title, value, trend, isTrendPositive, icon, iconBgColor, iconTextColor }) {
    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${iconBgColor} ${iconTextColor}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
            </div>
        </div>
    );
}
