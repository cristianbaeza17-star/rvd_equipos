import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { apiService } from '../services/apiService';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Empieza en true hasta que sepamos el estado
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // onAuthStateChange se dispara inmediatamente con la sesión actual al cargar
        // y luego escucha los cambios. Es la única fuente de verdad que necesitamos.
        const authListener = apiService.onAuthStateChange((user) => {
            setCurrentUser(user);
            setLoading(false); // Una vez que tenemos una respuesta (user o null), la carga ha terminado.
        });

        // Limpiamos el listener cuando el componente se desmonta
        return () => {
            // FIX: The return type from apiService.onAuthStateChange is inconsistent.
            // This type guard handles both possible shapes to safely unsubscribe.
            if ('subscription' in authListener) {
                authListener.subscription?.unsubscribe();
            } else if ('data' in authListener) {
                authListener.data.subscription?.unsubscribe();
            }
        };
    }, []);

    const login = async (username: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            // El estado del usuario se actualizará automáticamente por el listener onAuthStateChange
            await apiService.login(username, password);
        } catch (err: any) {
            setError(err.message);
            throw err; // Re-lanzamos para que el componente Auth pueda manejarlo si es necesario
        } finally {
            // No ponemos setLoading(false) aquí, ya que el listener lo hará
        }
    };
    
    const register = async (username: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            // El estado del usuario se actualizará automáticamente por el listener onAuthStateChange
            await apiService.register(username, password);
        } catch (err: any)
 {
            setError(err.message);
            throw err;
        } finally {
             // No ponemos setLoading(false) aquí, ya que el listener lo hará
        }
    };

    const logout = async () => {
        await apiService.logout();
        // El estado del usuario se actualizará a null automáticamente por el listener
        setCurrentUser(null); 
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        loading, // ahora es loading, no loading: loading
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