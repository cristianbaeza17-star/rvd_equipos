import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, GameData } from '../types';

// Fix: Augment the global ImportMeta interface to make TypeScript aware of Vite's environment variables.
declare global {
    interface ImportMeta {
        readonly env: {
            readonly VITE_SUPABASE_URL: string;
            readonly VITE_SUPABASE_ANON_KEY: string;
        }
    }
}

// Se leen las variables de entorno inyectadas por Vercel (o desde un archivo .env local)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key must be provided in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY).");
}

// Inicializamos el cliente de Supabase una sola vez
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export const apiService = {
    // Escucha cambios en el estado de autenticación (login, logout)
    onAuthStateChange(callback: (user: User | null) => void) {
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            const user = session?.user ? { id: session.user.id, username: session.user.email! } : null;
            callback(user);
        });
        return authListener;
    },

    async register(username: string, password: string): Promise<User> {
        const { data, error } = await supabase.auth.signUp({
            email: username, // Supabase usa email como identificador principal
            password: password,
        });

        if (error) {
            throw new Error(error.message);
        }
        if (!data.user) {
            throw new Error("Registro fallido, no se pudo obtener el usuario.");
        }

        return { id: data.user.id, username: data.user.email! };
    },

    async login(username: string, password: string): Promise<User> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: username,
            password: password,
        });

        if (error) {
            throw new Error(error.message || 'Email o contraseña incorrectos.');
        }
         if (!data.user) {
            throw new Error("Login fallido, no se pudo obtener el usuario.");
        }

        return { id: data.user.id, username: data.user.email! };
    },
    
    async logout() {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        }
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
            return null;
        }
        return { id: session.user.id, username: session.user.email! };
    },

    async saveGameData(userId: string, sessionData: GameData[]): Promise<void> {
        const dataToInsert = sessionData.map(item => ({
            user_id: userId,
            fecha: new Date(item.id).toISOString(),
            tipo_de_ejercicio: item.tipoDeEjercicio,
            tiempo_de_respuesta: item.tiempoDeRespuesta,
            precision: item.precision
        }));

        const { error } = await supabase.from('game_data').insert(dataToInsert);

        if (error) {
            console.error('Error saving game data:', error);
            throw new Error('No se pudieron guardar los datos del entrenamiento.');
        }
    },
    
    async getGameData(userId: string): Promise<GameData[]> {
         const { data, error } = await supabase
            .from('game_data')
            .select('*')
            .eq('user_id', userId)
            .order('fecha', { ascending: false });

        if (error) {
            console.error('Error fetching game data:', error);
            throw new Error('No se pudieron obtener los datos del entrenamiento.');
        }
        
        return data.map((item: any) => ({
            id: new Date(item.fecha).getTime(),
            fecha: new Date(item.fecha).toLocaleString(),
            tipoDeEjercicio: item.tipo_de_ejercicio,
            tiempoDeRespuesta: item.tiempo_de_respuesta,
            precision: item.precision,
        }));
    }
};