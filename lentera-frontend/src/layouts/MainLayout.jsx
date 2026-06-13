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
            className="text-lg font-bold text-[#0c4a6e] hover:opacity-90 cursor-pointer transition-opacity"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Resolv<span className="text-[#0052cc]">Admin</span>
          </span>
        </div>
        
        {/* Kanan: Bell, Settings, Avatar */}
        <div className="flex items-center gap-4">
          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors relative" title="Notifications">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <button className="p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors" title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
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