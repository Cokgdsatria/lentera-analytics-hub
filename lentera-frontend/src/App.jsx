import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ComplaintPage from './pages/ComplaintPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik dengan MainLayout (Ada Navbar) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<ComplaintPage />} />
        </Route>

        {/* Rute Login & Admin (Tanpa Navbar Publik) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Rute Admin (Dilindungi dengan ProtectedRoute & Menggunakan AdminLayout) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<DashboardPage />} />
            <Route path="/admin/complaints" element={<div className="p-10 text-2xl font-semibold text-slate-800">Semua Pengaduan</div>} />
            <Route path="/admin/analytics" element={<div className="p-10 text-2xl font-semibold text-slate-800">Analisis Pengaduan</div>} />
            <Route path="/admin/settings" element={<div className="p-10 text-2xl font-semibold text-slate-800">Pengaturan Sistem</div>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;