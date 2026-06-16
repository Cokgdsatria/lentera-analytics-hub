import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import ComplaintPage from './pages/ComplaintPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminComplaintsPage from './pages/AdminComplaintsPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import AnalyticsPage from './pages/AnalyticsPage';

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
            {/* 1. Halaman utama Dashboard Overview */}
            <Route path="/admin/dashboard" element={<DashboardPage />} />

            {/* 2. Halaman daftar semua pengaduan (Sudah diperbaiki ke komponen asli) */}
            <Route path="/admin/complaints" element={<AdminComplaintsPage />} />
            <Route path="/admin/complaints/:id" element={<ComplaintDetailPage />} />

            {/* 3. Halaman Analisis Pengaduan */}
            <Route path="/admin/analytics" element={<AnalyticsPage />} />

            {/* 4. Halaman Pengaturan Sistem */}
            <Route path="/admin/settings" element={<div className="p-10 text-2xl font-semibold text-slate-800">Pengaturan Sistem</div>} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
