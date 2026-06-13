import { useState, useRef } from 'react';

export default function ComplaintForm({ onSubmitSuccess }) {
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [category, setCategory] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [errors, setErrors] = useState({});

    const fileInputRef = useRef(null);
    const maxCharLimit = 1000;

    const handleDescriptionChange = (e) => {
        const text = e.target.value;
        if (text.length <= maxCharLimit) {
            setDescription(text);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const removeSelectedFile = (e) => {
        e.stopPropagation();
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current.click();
    };

    const handleCancel = () => {
        setIsAnonymous(false);
        setFirstName('');
        setLastName('');
        setEmail('');
        setCompanyName('');
        setCategory('');
        setDescription('');
        setSelectedFile(null);
        setErrors({});
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!companyName) newErrors.companyName = 'Company name is required';
        if (!category) newErrors.category = 'Category is required';
        if (!description.trim()) newErrors.description = 'Description is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmitSuccess(); // Panggil fungsi dari parent komponen
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 relative overflow-hidden">
            {/* Decorative progress-like blue highlight line on top */}
            <div className="absolute top-0 left-0 w-40 h-[3px] bg-blue-600 rounded-tr-md"></div>

            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6">
                {/* A. Personal Details */}
                <div>
                    <h2 className="text-base font-bold text-slate-800 mb-4">Personal Details</h2>

                    <div className="bg-[#f8fafc] border border-slate-100 p-4 rounded-lg flex items-center justify-between mb-5">
                        <div>
                            <p className="text-xs md:text-sm font-semibold text-slate-800">Submit Anonymously</p>
                            <p className="text-[11px] md:text-xs text-slate-500 mt-0.5">Your identity will be protected and hidden from reviewers.</p>
                        </div>

                        <button
                            type="button"
                            role="switch"
                            aria-checked={isAnonymous}
                            onClick={() => setIsAnonymous(!isAnonymous)}
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${isAnonymous ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                            <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${isAnonymous ? 'translate-x-5' : 'translate-x-0'}`}
                            />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">First Name</label>
                            <input
                                type="text"
                                value={isAnonymous ? '' : firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                disabled={isAnonymous}
                                placeholder="Jane"
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs md:text-sm transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 disabled:cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Last Name</label>
                            <input
                                type="text"
                                value={isAnonymous ? '' : lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                disabled={isAnonymous}
                                placeholder="Doe"
                                className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs md:text-sm transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 disabled:cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                        <input
                            type="email"
                            value={isAnonymous ? '' : email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isAnonymous}
                            placeholder="jane.doe@example.com"
                            className="w-full px-3.5 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs md:text-sm transition-all bg-white disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100 disabled:cursor-not-allowed"
                        />
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* B. Complaint Details */}
                <div>
                    <h2 className="text-base font-bold text-slate-800 mb-4">Complaint Details</h2>

                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Company Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={companyName}
                                onChange={(e) => {
                                    setCompanyName(e.target.value);
                                    if (errors.companyName) setErrors({ ...errors, companyName: null });
                                }}
                                className={`w-full px-3.5 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs md:text-sm transition-all appearance-none bg-white pr-10 ${errors.companyName ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`}
                            >
                                <option value="">Select a company...</option>
                                <option value="PT. Lentera Indonesia">PT. Lentera Indonesia</option>
                                <option value="PT. Pijak Lentera">PT. Pijak Lentera</option>
                                <option value="ResolvCorp">ResolvCorp</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                </svg>
                            </div>
                        </div>
                        {errors.companyName && <p className="text-red-500 text-[11px] mt-1">{errors.companyName}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => {
                                    setCategory(e.target.value);
                                    if (errors.category) setErrors({ ...errors, category: null });
                                }}
                                className={`w-full px-3.5 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs md:text-sm transition-all appearance-none bg-white pr-10 ${errors.category ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`}
                            >
                                <option value="">Select a category...</option>
                                <option value="Customer Service">Customer Service</option>
                                <option value="System Glitch">System Glitch</option>
                                <option value="Infrastructure Issue">Infrastructure Issue</option>
                                <option value="Security / Privacy">Security / Privacy</option>
                                <option value="Other">Other</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
                                </svg>
                            </div>
                        </div>
                        {errors.category && <p className="text-red-500 text-[11px] mt-1">{errors.category}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            rows="5"
                            value={description}
                            onChange={(e) => {
                                handleDescriptionChange(e);
                                if (errors.description) setErrors({ ...errors, description: null });
                            }}
                            placeholder="Please describe the incident in detail..."
                            className={`w-full px-3.5 py-2 border rounded-md focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs md:text-sm transition-all resize-none ${errors.description ? 'border-red-400 focus:border-red-500' : 'border-slate-200'}`}
                        ></textarea>
                        <div className="flex justify-between items-center mt-1">
                            {errors.description ? (
                                <p className="text-red-500 text-[11px]">{errors.description}</p>
                            ) : (
                                <div></div>
                            )}
                            <p className="text-[11px] text-slate-400 font-medium">
                                {description.length} / {maxCharLimit} characters
                            </p>
                        </div>
                    </div>
                </div>

                {/* C. Supporting Evidence */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Supporting Evidence (Optional)</label>
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={triggerFileSelect}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${isDragOver ? 'border-blue-500 bg-blue-50/30' : selectedFile ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50/30'}`}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                            accept=".png,.jpg,.jpeg,.pdf"
                        />
                        {!selectedFile ? (
                            <div className="space-y-2">
                                <div className="w-9 h-9 bg-slate-50 text-slate-500 rounded-md flex items-center justify-center mx-auto border border-slate-100">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <p className="text-xs md:text-sm font-semibold text-slate-700">Click to upload or drag and drop</p>
                                <p className="text-[10px] md:text-xs text-slate-400">PDF, JPG, PNG up to 10MB</p>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between max-w-md mx-auto p-2 border border-slate-100 bg-white rounded-md shadow-2xs">
                                <div className="flex items-center gap-2 text-left truncate">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="truncate">
                                        <p className="text-xs font-semibold text-slate-700 truncate">{selectedFile.name}</p>
                                        <p className="text-[10px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={removeSelectedFile}
                                    className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-50 transition-colors"
                                    title="Remove File"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-slate-100" />

                {/* D. Form Actions */}
                <div className="flex justify-end items-center gap-3 pt-2">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 text-xs md:text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-md transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-5 py-2.5 text-xs md:text-sm font-semibold bg-[#0052cc] hover:bg-[#004bb3] text-white rounded-md transition-all shadow-xs flex items-center gap-1.5 cursor-pointer hover:shadow-sm"
                    >
                        Submit Complaint <span>➤</span>
                    </button>
                </div>
            </form>
        </div>
    );
}