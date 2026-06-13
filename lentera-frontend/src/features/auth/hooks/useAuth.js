import { useState } from 'react';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        // Simulasi delay jaringan (API Call)
        return new Promise((resolve) => {
            setTimeout(() => {
                // Kredensial *dummy* untuk keperluan testing
                if (email === 'admin@resolv.com' && password === 'admin123') {
                    // Simulasi menyimpan token ke localStorage
                    localStorage.setItem('adminToken', 'mock-jwt-token-123');
                    setIsLoading(false);
                    resolve({ success: true });
                } else {
                    setIsLoading(false);
                    setError('Email atau password yang Anda masukkan salah.');
                    resolve({ success: false });
                }
            }, 1000);
        });
    };

    // Fungsi untuk logout nanti
    const logout = () => {
        localStorage.removeItem('adminToken');
    };

    return { login, logout, isLoading, error };
};