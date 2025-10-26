import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const Auth: React.FC = () => {
    const [isLoginView, setIsLoginView] = useState(true);
    const { login, register, loading, error } = useAuth();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLoginView) {
                await login(username, password);
            } else {
                await register(username, password);
            }
        } catch (err) {
            // Error is handled in the context and displayed
        }
    };

    return (
        <div className="w-full max-w-md p-8 space-y-6 bg-slate-800/50 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-lg z-10">
            <div className="text-center">
                 <h1 className="text-3xl font-bold text-white">
                    {isLoginView ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </h1>
                <p className="text-slate-400">
                    {isLoginView ? 'Bienvenido de nuevo a tu entrenamiento' : 'Únete para guardar tu progreso'}
                </p>
            </div>
           
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label
                        htmlFor="username"
                        className="text-sm font-medium text-slate-300 block mb-2"
                    >
                        Nombre de Usuario
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                 <div>
                    <label
                        htmlFor="password"
                        className="text-sm font-medium text-slate-300 block mb-2"
                    >
                        Contraseña
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                <div>
                     <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-indigo-500"
                    >
                        {loading ? 'Cargando...' : (isLoginView ? 'Entrar' : 'Registrarse')}
                    </button>
                </div>
            </form>
            <p className="text-center text-sm text-slate-400">
                {isLoginView ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}
                <button
                    onClick={() => {
                        setIsLoginView(!isLoginView);
                    }}
                    className="font-medium text-indigo-400 hover:underline ml-2"
                >
                    {isLoginView ? 'Regístrate' : 'Inicia Sesión'}
                </button>
            </p>
        </div>
    );
};
