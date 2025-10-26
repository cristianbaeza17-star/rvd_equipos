import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { apiService, isSupabaseConfigured } from '../services/apiService';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: ReactNode}> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isSupabaseConfigured) {
            // En modo offline, no hay estado de autenticación que verificar al inicio.
            setLoading(false);
            return;
        }

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
            if (authListener && 'subscription' in authListener) {
                authListener.subscription?.unsubscribe();
            } else if (authListener && 'data' in authListener) {
                authListener.data.subscription?.unsubscribe();
            }
        };
    }, []);

    const login = async (username: string, password: string) => {
        setLoading(true);
        setError(null);

        if (!isSupabaseConfigured) {
            // Simulación de login para modo offline
            if (username.trim()) {
                setCurrentUser({ id: 'local-user', username });
            } else {
                setError("El nombre de usuario no puede estar vacío.");
            }
            setLoading(false);
            return;
        }

        try {
            // El estado del usuario se actualizará automáticamente por el listener onAuthStateChange,
            // que también pondrá setLoading(false) en caso de éxito.
            await apiService.login(username, password);
        } catch (err: any) {
            setError(err.message);
            setLoading(false); // Es importante resetear el estado de carga en caso de error.
            throw err; // Re-lanzamos para que el componente Auth pueda manejarlo si es necesario
        }
    };
    
    const register = async (username: string, password: string) => {
        setLoading(true);
        setError(null);

        if (!isSupabaseConfigured) {
            // Simulación de registro para modo offline
            if (username.trim()) {
                setCurrentUser({ id: 'local-user', username });
            } else {
                setError("El nombre de usuario no puede estar vacío.");
            }
            setLoading(false);
            return;
        }
        
        try {
             // El estado del usuario se actualizará automáticamente por el listener onAuthStateChange,
            // que también pondrá setLoading(false) en caso de éxito.
            await apiService.register(username, password);
        } catch (err: any)
 {
            setError(err.message);
            setLoading(false); // Es importante resetear el estado de carga en caso de error.
            throw err;
        }
    };

    const logout = async () => {
        if (!isSupabaseConfigured) {
            setCurrentUser(null);
            try {
                localStorage.removeItem('rvd-game-data');
            } catch (e) {
                console.error("Error al limpiar almacenamiento local:", e);
            }
            return;
        }
        await apiService.logout();
        // El estado del usuario se actualizará a null automáticamente por el listener
        setCurrentUser(null); 
    };

    const value = {
        currentUser,
        login,
        register,
        logout,
        loading,
        error
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
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