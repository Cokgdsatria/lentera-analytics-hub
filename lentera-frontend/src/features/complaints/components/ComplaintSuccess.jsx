export default function ComplaintSuccess({ complaint, onReset }) {
    return (
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200 p-8 text-center mt-10">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Complaint Submitted Successfully</h2>
            <p className="text-slate-500 text-sm mb-6">
                Thank you for sharing your concerns. Your reference number is <span className="font-semibold text-slate-700">{complaint?.public_id || 'Processing'}</span>.
                We will review it promptly.
            </p>
            <button
                onClick={onReset}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors text-sm shadow-xs cursor-pointer"
            >
                Submit Another Complaint
            </button>
        </div>
    );
}
