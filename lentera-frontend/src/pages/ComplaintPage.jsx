import { useState } from 'react';
import ComplaintForm from '../features/complaints/components/ComplaintForm';
import ComplaintSuccess from '../features/complaints/components/ComplaintSuccess';

export default function ComplaintPage() {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submittedComplaint, setSubmittedComplaint] = useState(null);

    if (isSubmitted) {
        return <ComplaintSuccess complaint={submittedComplaint} onReset={() => {
            setSubmittedComplaint(null);
            setIsSubmitted(false);
        }} />;
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Header Halaman */}
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-[#0c4a6e] mb-2">Secure Complaint Submission</h1>
                <p className="text-slate-500 text-xs md:text-sm max-w-xl mx-auto leading-relaxed">
                    Our system is designed to handle your concerns with confidentiality and efficiency. Please provide as much detail as possible to help us resolve the issue promptly.
                </p>
            </div>

            {/* Render Komponen Form */}
            <ComplaintForm onSubmitSuccess={(complaint) => {
                setSubmittedComplaint(complaint);
                setIsSubmitted(true);
            }} />

            {/* Footer Encryption Notice */}
            <div className="text-center mt-6 text-[11px] md:text-xs text-slate-500 flex items-center justify-center gap-1.5 leading-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>End-to-end encrypted. Your data is processed according to our <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.</span>
            </div>
        </div>
    );
}
