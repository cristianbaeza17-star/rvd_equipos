import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Usamos el método onAuthStateChange de Supabase para saber si hay un usuario
        // logueado al cargar la app y para escuchar cambios de sesión en tiempo real.
        const checkUser = async () => {
            const user = await apiService.getCurrentUser();
            setCurrentUser(user);
            setLoading(false);
        };
        
        checkUser();

        const authListener = apiService.onAuthStateChange((user) => {
            setCurrentUser(user);
            // Si el listener se activa, significa que la carga inicial ya terminó.
            if (loading) setLoading(false);
        });

        // Limpiamos el listener cuando el componente se desmonta
        return () => {
            authListener.subscription?.unsubscribe();
        };
    }, [loading]);

    const login = async (username: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const user = await apiService.login(username, password);
            setCurrentUser(user);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };
    
    const register = async (username: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            // El login se maneja automáticamente por el onAuthStateChange
            await apiService.register(username, password);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        await apiService.logout();
        setCurrentUser(null);
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        loading: loading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};