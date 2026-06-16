import { useState } from 'react';
import ComplaintTable from '../features/complaints/components/ComplaintTable';
import { complaintApi } from '../services/api';

export default function AdminComplaintsPage() {
    const [exportError, setExportError] = useState(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        setExportError(null);
        try {
            const blob = await complaintApi.exportCsv();
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'lentera-complaints.csv';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(url);
        } catch (err) {
            setExportError(err.message || 'Failed to export complaints.');
        } finally {
            setIsExporting(false);
        }
    };

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
                <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    {isExporting ? 'Exporting...' : 'Export Data'}
                </button>
            </div>

            {exportError && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 text-xs font-semibold text-red-600 rounded-lg">
                    {exportError}
                </div>
            )}

            {/* Main Table Component */}
            <ComplaintTable />
        </div>
    );
}
