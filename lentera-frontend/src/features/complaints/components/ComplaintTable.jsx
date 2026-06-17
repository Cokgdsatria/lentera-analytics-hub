import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintApi } from '../../../services/api';

const AVATAR_COLORS = [
    'bg-blue-100 text-blue-600',
    'bg-violet-100 text-violet-600',
    'bg-amber-100 text-amber-600',
    'bg-rose-100 text-rose-600',
    'bg-emerald-100 text-emerald-600',
    'bg-cyan-100 text-cyan-600',
];
const ITEMS_PER_PAGE = 10;

function getAvatarColor(name) {
    const safeName = name || 'Unknown';
    const code = safeName.charCodeAt(0);
    return AVATAR_COLORS[code % AVATAR_COLORS.length];
}

function getInitials(name) {
    return (name || 'Unknown')
        .split(' ')
        .slice(0, 2)
        .map(n => n[0])
        .join('')
        .toUpperCase();
}

function nextStatus(status) {
    if (status === 'Pending') return 'In Progress';
    if (status === 'In Progress') return 'Resolved';
    return 'Pending';
}

export default function ComplaintTable() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [urgencyFilter, setUrgencyFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const [complaints, setComplaints] = useState([]);
    const [submittedCategoryById, setSubmittedCategoryById] = useState({});
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchComplaints = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await complaintApi.list({
                search,
                urgency: urgencyFilter,
                status: statusFilter,
                skip: (currentPage - 1) * ITEMS_PER_PAGE,
                limit: ITEMS_PER_PAGE,
            });
            setComplaints(response.items);
            setTotalItems(response.total);
        } catch (err) {
            setError(err.message || 'Failed to load complaints.');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, search, statusFilter, urgencyFilter]);

    useEffect(() => {
        fetchComplaints();
    }, [fetchComplaints, refreshKey]);

    useEffect(() => {
        let isMounted = true;

        async function hydrateSubmittedCategories() {
            const missing = complaints
                .map((item) => item.id)
                .filter((id) => id && !submittedCategoryById[id]);
            if (!missing.length) return;

            try {
                const results = await Promise.all(
                    missing.map(async (id) => {
                        const complaint = await complaintApi.get(id);
                        return [id, complaint?.category];
                    }),
                );

                if (!isMounted) return;
                setSubmittedCategoryById((prev) => {
                    const next = { ...prev };
                    for (const [id, category] of results) {
                        if (category) next[id] = category;
                    }
                    return next;
                });
            } catch {
            }
        }

        hydrateSubmittedCategories();
        return () => {
            isMounted = false;
        };
    }, [complaints, submittedCategoryById]);

    const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));

    const urgencyBadge = (urgency) => {
        switch (urgency) {
            case 'High':   return 'bg-red-50 text-red-600 border border-red-100';
            case 'Medium': return 'bg-amber-50 text-amber-600 border border-amber-100';
            case 'Low':    return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            default:       return 'bg-slate-50 text-slate-500 border border-slate-100';
        }
    };

    const urgencyDot = (urgency) => {
        switch (urgency) {
            case 'High':   return 'bg-red-500';
            case 'Medium': return 'bg-amber-500';
            case 'Low':    return 'bg-emerald-500';
            default:       return 'bg-slate-400';
        }
    };

    const statusBadge = (status) => {
        switch (status) {
            case 'Pending':     return 'bg-orange-50 text-orange-600 border border-orange-100';
            case 'In Progress': return 'bg-blue-50 text-blue-600 border border-blue-100';
            case 'Resolved':    return 'bg-emerald-50 text-emerald-600 border border-emerald-100';
            default:            return 'bg-slate-50 text-slate-500 border border-slate-100';
        }
    };

    const statusDot = (status) => {
        switch (status) {
            case 'Pending':     return 'bg-orange-500';
            case 'In Progress': return 'bg-blue-500';
            case 'Resolved':    return 'bg-emerald-500';
            default:            return 'bg-slate-400';
        }
    };

    const handleAdvanceStatus = async (item) => {
        try {
            await complaintApi.update(item.id, { status: nextStatus(item.status) });
            setRefreshKey(key => key + 1);
        } catch (err) {
            setError(err.message || 'Failed to update complaint.');
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                <div className="relative flex-1 sm:max-w-sm">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                        </svg>
                    </span>
                    <input
                        type="text"
                        placeholder="Search by name, ID, or category..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all placeholder:text-slate-400"
                    />
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <select
                        value={urgencyFilter}
                        onChange={(e) => { setUrgencyFilter(e.target.value); setCurrentPage(1); }}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer hover:border-slate-300 transition-colors"
                    >
                        <option value="All">All Urgency</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 cursor-pointer hover:border-slate-300 transition-colors"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>
            </div>

            {error && (
                <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-xs font-semibold text-red-600">
                    {error}
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[680px]">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <th className="py-3 px-5">Complaint ID</th>
                            <th className="py-3 px-5">Date Filed</th>
                            <th className="py-3 px-5">Customer</th>
                            <th className="py-3 px-5">Category</th>
                            <th className="py-3 px-5">Urgency</th>
                            <th className="py-3 px-5">Status</th>
                            <th className="py-3 px-5 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="py-14 text-center text-slate-400 font-semibold">
                                    Loading complaints...
                                </td>
                            </tr>
                        ) : complaints.length > 0 ? (
                            complaints.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors group">
                                    <td className="py-3.5 px-5">
                                        <span className="font-bold text-blue-600 font-mono text-[11px] tracking-wide">
                                            {item.id}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5 text-slate-400 font-medium text-[11px]">{item.date}</td>
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${getAvatarColor(item.customer)}`}>
                                                {getInitials(item.customer)}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-slate-800 text-[12px] leading-tight">{item.customer}</div>
                                                <div className="text-[10px] text-slate-400 font-medium leading-tight mt-0.5">{item.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-5 text-slate-600 font-semibold text-[11px]">
                                        <span className="block max-w-[220px] truncate" title={submittedCategoryById[item.id] || item.category}>
                                            {submittedCategoryById[item.id] || item.category}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${urgencyBadge(item.urgency)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${urgencyDot(item.urgency)}`}></span>
                                            {item.urgency}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${statusBadge(item.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot(item.status)}`}></span>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-5">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={() => navigate(`/admin/complaints/${item.id}`)}
                                                title="View Detail"
                                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="py-14 text-center">
                                    <div className="flex flex-col items-center gap-2 text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-xs font-semibold">No complaints found matching your filters.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400 font-medium">
                    Showing <span className="font-bold text-slate-600">{complaints.length}</span> of <span className="font-bold text-slate-600">{totalItems}</span> complaints
                </p>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 text-[11px] font-bold rounded-md transition-colors ${
                                page === currentPage
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-500 bg-white border border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-[11px] font-semibold text-slate-500 bg-white border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
