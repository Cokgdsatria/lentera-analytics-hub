import ComplaintTable from '../features/complaints/components/ComplaintTable';

export default function AdminComplaintsPage() {
    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">All Complaints</h1>
                    <p className="text-xs text-slate-400 font-medium mt-1">
                        Review, analyze, and manage incoming consumer administrative grievances.
                    </p>
                </div>

                {/* Export Button */}
                <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-all shadow-xs shrink-0 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Export Data
                </button>
            </div>

            {/* Main Table Component */}
            <ComplaintTable />
        </div>
    );
}