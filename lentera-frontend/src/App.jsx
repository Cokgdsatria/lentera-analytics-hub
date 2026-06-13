import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ComplaintPage from './pages/ComplaintPage';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rute Publik dengan MainLayout (Ada Navbar) */}
        <Route element={< MainLayout/>}>
          <Route path="/" element={<ComplaintPage />} />
        </Route>

        {/* Rute Login & Admin (Tanpa Navbar Publik) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Placeholder untuk Dashboard nanti */}
        <Route path="/admin/dashboard" element={<div className="p-10 text-2xl">Halaman Dashboard Admin</div>} />
      </Routes>
    </Router>
  );
}

export default App;
