import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User, GameData } from '../types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Inicializamos el cliente de forma condicional.
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
    console.warn("Advertencia: Las variables de entorno de Supabase no están configuradas. La autenticación y el guardado de datos no funcionarán.");
}

const getClient = (): SupabaseClient => {
    if (!supabase) {
        throw new Error("La conexión con la base de datos no está configurada. Por favor, contacta al administrador.");
    }
    return supabase;
}

export const apiService = {
    onAuthStateChange(callback: (user: User | null) => void) {
        if (!supabase) {
            // Si Supabase no está configurado, no podemos escuchar cambios.
            // Llamamos al callback con null para que la app no se quede cargando.
            callback(null);
            return { data: { subscription: { unsubscribe: () => {} } } };
        }
        
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            const user = session?.user ? { id: session.user.id, username: session.user.email! } : null;
            callback(user);
        });
        return authListener;
    },

    async register(username: string, password: string): Promise<User> {
        const client = getClient();
        const { data, error } = await client.auth.signUp({
            email: username,
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
        const client = getClient();
        const { data, error } = await client.auth.signInWithPassword({
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
        const client = supabase; // No usar getClient para no lanzar error
        if (!client) return;
        const { error } = await client.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        }
    },

    async getCurrentUser(): Promise<User | null> {
        const client = getClient();
        const { data: { session } } = await client.auth.getSession();
        if (!session?.user) {
            return null;
        }
        return { id: session.user.id, username: session.user.email! };
    },

    async saveGameData(userId: string, sessionData: GameData[]): Promise<void> {
        const client = getClient();
        const dataToInsert = sessionData.map(item => ({
            user_id: userId,
            fecha: new Date(item.id).toISOString(),
            tipo_de_ejercicio: item.tipoDeEjercicio,
            tiempo_de_respuesta: item.tiempoDeRespuesta,
            precision: item.precision
        }));

        const { error } = await client.from('game_data').insert(dataToInsert);

        if (error) {
            console.error('Error saving game data:', error);
            throw new Error('No se pudieron guardar los datos del entrenamiento.');
        }
    },
    
    async getGameData(userId: string): Promise<GameData[]> {
         const client = getClient();
         const { data, error } = await client
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