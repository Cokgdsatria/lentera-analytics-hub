import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

export default function Sidebar({ isOpen, onClose }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const navItems = [
        { name: 'Overview', path: '/admin/dashboard', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        )},
        { name: 'All Complaints', path: '/admin/complaints', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        )},
        { name: 'Analytics', path: '/admin/analytics', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        )},
        { name: 'System Settings', path: '/admin/settings', icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
        )}
    ];

    const sidebarContent = (
        <aside className="w-64 bg-white h-full flex flex-col">
            {/* Logo Area */}
            <div className="p-5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#0052cc] rounded-md flex items-center justify-center text-white font-bold text-lg shadow-xs">
                        R
                    </div>
                    <div>
                        <h1 className="text-base font-extrabold text-[#0c4a6e] leading-tight">Resolv</h1>
                        <p className="text-[10px] text-slate-400 font-medium tracking-wide">Management Suite</p>
                    </div>
                </div>
                {/* Close button — only visible on mobile */}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Action Button */}
            <div className="px-4 pt-5 pb-3">
                <button
                    onClick={() => { navigate('/'); onClose?.(); }}
                    className="w-full bg-[#0052cc] hover:bg-[#004bb3] text-white font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-xs text-sm cursor-pointer hover:shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                    File New Report
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-3 space-y-1 py-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={onClose}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                                isActive
                                ? 'bg-[#0052cc] text-white shadow-xs'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`
                        }
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom Links */}
            <div className="p-4 border-t border-slate-100 space-y-1">
                <a href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Help Center
                </a>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    Logout
                </button>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop: static sidebar */}
            <div className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 lg:border-r lg:border-slate-200 lg:h-screen lg:sticky lg:top-0">
                {sidebarContent}
            </div>

            {/* Mobile: overlay drawer */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                        onClick={onClose}
                    />
                    {/* Drawer panel */}
                    <div className="fixed inset-y-0 left-0 z-50 flex flex-col shadow-2xl lg:hidden">
                        {sidebarContent}
                    </div>
                </>
            )}
        </>
    );
}