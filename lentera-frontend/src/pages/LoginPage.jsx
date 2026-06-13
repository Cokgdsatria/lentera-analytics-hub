import { useNavigate } from 'react-router-dom';
import LoginForm from '../features/auth/components/LoginForm';

export default function LoginPage() {
    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        // Arahkan ke rute dashboard setelah login sukses
        navigate('/admin/dashboard');
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-center items-center p-4">
            
            {/* Tombol kembali ke form publik (Opsional, agar mudah testing) */}
            <div className="absolute top-6 left-6">
                <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Return to Public Service
                </button>
            </div>

            {/* Render Komponen Form Login */}
            <LoginForm onSuccess={handleLoginSuccess} />
            
        </div>
    );
}