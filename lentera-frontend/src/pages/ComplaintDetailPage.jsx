import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { complaintApi } from '../services/api';

export default function ComplaintDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [complaint, setComplaint] = useState(null);
    const [status, setStatus] = useState('Pending');
    const [notes, setNotes] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadComplaint() {
            setIsLoading(true);
            setError(null);
            try {
                const response = await complaintApi.get(id);
                if (!isMounted) return;
                setComplaint(response);
                setStatus(response.status);
                setNotes(response.resolution_notes || '');
            } catch (err) {
                if (isMounted) setError(err.message || 'Failed to load complaint.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        loadComplaint();

        return () => {
            isMounted = false;
        };
    }, [id]);

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        try {
            const response = await complaintApi.update(id, {
                status,
                resolution_notes: notes,
            });
            setComplaint(response);
            setStatus(response.status);
            setNotes(response.resolution_notes || '');
        } catch (err) {
            setError(err.message || 'Failed to update complaint.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="p-10 text-sm font-semibold text-slate-400">Loading complaint...</div>;
    }

    if (!complaint) {
        return (
            <div className="p-10 space-y-4">
                <p className="text-sm font-semibold text-red-600">{error || 'Complaint not found.'}</p>
                <button onClick={() => navigate('/admin/complaints')} className="text-sm text-blue-600 font-semibold hover:underline">
                    Back to complaints
                </button>
            </div>
        );
    }

    const reporter = complaint.is_anonymous
        ? 'Anonymous'
        : [complaint.first_name, complaint.last_name].filter(Boolean).join(' ') || 'Unknown Reporter';

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <button onClick={() => navigate('/admin/complaints')} className="text-xs text-blue-600 font-bold hover:underline mb-3">
                        Back to complaints
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">{complaint.public_id}</h1>
                    <p className="text-xs text-slate-400 font-medium mt-1">{complaint.company_name}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100">
                    {complaint.status}
                </span>
            </div>

            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 text-xs font-semibold text-red-600 rounded-lg">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
                    <div>
                        <h2 className="text-sm font-bold text-slate-800 mb-2">Complaint Description</h2>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{complaint.description}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <Info label="Reporter" value={reporter} />
                        <Info label="Email" value={complaint.is_anonymous ? 'Protected' : complaint.email || '-'} />
                        <Info label="Submitted Category" value={complaint.category} />
                        <Info label="Evidence" value={complaint.evidence_filename || 'No file'} />
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
                    <h2 className="text-sm font-bold text-slate-800">ML Inference</h2>
                    <div className="grid grid-cols-1 gap-3 text-xs">
                        <Info label="Predicted Category" value={complaint.predicted_category} />
                        <Info label="Urgency" value={complaint.urgency} />
                        <Info label="Sentiment" value={complaint.sentiment} />
                        <Info label="Confidence" value={`${Math.round(complaint.confidence * 100)}%`} />
                        <Info label="Provider" value={`${complaint.inference_provider} (${complaint.inference_version})`} />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h2 className="text-sm font-bold text-slate-800">Resolution</h2>
                <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
                        <select
                            value={status}
                            onChange={(event) => setStatus(event.target.value)}
                            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Resolution Notes</label>
                        <textarea
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                            rows="4"
                            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                            placeholder="Add internal handling notes..."
                        />
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md shadow-xs disabled:bg-blue-300 disabled:cursor-not-allowed"
                    >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{label}</p>
            <p className="font-semibold text-slate-700 break-words">{value || '-'}</p>
        </div>
    );
}
