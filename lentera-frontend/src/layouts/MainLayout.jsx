import { Outlet, useNavigate } from 'react-router-dom';

export default function MainLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      {/* Navbar Publik */}
      <nav className="bg-white border-b border-slate-100 px-8 py-3.5 flex justify-between items-center sticky top-0 z-10 shadow-xs">
        
        {/* Kiri: Logo & Nama Aplikasi */}
        <div className="flex items-center gap-3">
          <span 
            onClick={() => navigate('/')} 
            className="text-lg font-extrabold bg-gradient-to-r from-[#6b0f1a] via-[#9f1239] to-[#7f1d1d] text-transparent bg-clip-text hover:opacity-90 cursor-pointer transition-opacity"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Lentera
          </span>
        </div>
        
        {/* Kanan: Avatar */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-hidden"
            title="Login Admin"
          >
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              alt="Admin Profile" 
              className="w-full h-full object-cover"
            />
          </button>
        </div>
        
      </nav>

      {/* Area Konten */}
      <main className="flex-1 px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
