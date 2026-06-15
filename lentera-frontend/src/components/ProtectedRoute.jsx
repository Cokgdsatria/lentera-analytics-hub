import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
    // Mengecek token simulasi dari localStorage
    const isAuthenticated = localStorage.getItem('adminToken');

    if (!isAuthenticated) {
        // Redirect ke login jika tidak ada token, replace: true agar tidak bisa di-back
        return <Navigate to="/login" replace />;
    }

    // Mendukung penggunaan sebagai wrapper komponen atau Nested Route (Outlet)
    return children ? children : <Outlet />;
}