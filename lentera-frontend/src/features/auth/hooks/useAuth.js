import { useState } from 'react';
import { authApi } from '../../../services/api';

export const useAuth = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await authApi.login(email, password);
            localStorage.setItem('adminToken', response.access_token);
            localStorage.setItem('adminEmail', response.admin.email);
            return { success: true };
        } catch (err) {
            setError(err.message || 'Email atau password yang Anda masukkan salah.');
            return { success: false };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminEmail');
    };

    return { login, logout, isLoading, error };
};
