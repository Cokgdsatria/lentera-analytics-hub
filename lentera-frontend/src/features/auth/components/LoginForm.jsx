import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export default function LoginForm({ onSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Menggunakan custom hook
    const { login, isLoading, error } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Memanggil fungsi login dari useAuth
        const result = await login(email, password);
        
        // Jika sukses, panggil callback onSuccess untuk pindah halaman
        if (result.success) {
            onSuccess();
        }
    };

    return (
        <div className="w-full max-w-[400px] bg-white rounded-xl shadow-xs border border-slate-200 p-8">
            
            {/* Header / Logo */}
            <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-[#0052cc] rounded-md flex items-center justify-center text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <span className="text-xl font-extrabold bg-gradient-to-r from-[#6b0f1a] via-[#9f1239] to-[#7f1d1d] text-transparent bg-clip-text">Lentera</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Admin Access</h1>
                <p className="text-sm text-slate-500">Enter your credentials to manage reports</p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-md text-center">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@resolv.com"
                            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] outline-none text-sm transition-all"
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">Password</label>
                        <a href="#" className="text-xs text-[#0052cc] hover:underline font-medium">Forgot password?</a>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-10 py-2 border border-slate-200 rounded-md focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] outline-none text-sm transition-all tracking-wider"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 bg-[#0052cc] hover:bg-[#004bb3] text-white font-semibold py-2.5 rounded-md transition-all flex items-center justify-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed shadow-xs"
                >
                    {isLoading ? 'Signing In...' : 'Sign In to Dashboard'}
                    {!isLoading && <span>→</span>}
                </button>
            </form>

            <hr className="my-6 border-slate-100" />

            {/* Footer */}
            <div className="flex items-center justify-center gap-1.5 text-slate-500 text-[11px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Protected by standard end-to-end encryption</span>
            </div>
        </div>
    );
}
