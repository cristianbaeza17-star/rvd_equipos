import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { GameData } from '../types';
import { StatCard } from './StatCard';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

export const ProgressSection: React.FC = () => {
    const { currentUser } = useAuth();
    const [data, setData] = useState<GameData[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!currentUser) return;
            setLoading(true);
            const storedData = await apiService.getGameData(currentUser.id);
            setData(storedData);

            const groupedData: { [key: string]: { totalPrecision: number, count: number } } = {};
            storedData.forEach(item => {
                const date = new Date(item.id).toLocaleDateString();
                if (!groupedData[date]) {
                    groupedData[date] = { totalPrecision: 0, count: 0 };
                }
                groupedData[date].totalPrecision += item.precision;
                groupedData[date].count++;
            });

            const formattedChartData = Object.keys(groupedData).map(date => ({
                date,
                precision: Math.round(groupedData[date].totalPrecision / groupedData[date].count)
            })).slice(-10);

            setChartData(formattedChartData);
            setLoading(false);
        };

        fetchData();
    }, [currentUser]);

    const totalSessions = data.length;
    const bestTime = totalSessions > 0 ? Math.min(...data.map(d => d.tiempoDeRespuesta)) : 0;
    const overallAccuracy = totalSessions > 0 ? Math.round(data.reduce((sum, d) => sum + d.precision, 0) / totalSessions) : 0;

    if (loading) {
         return <div className="text-center text-white">Cargando progreso...</div>
    }

    if (totalSessions === 0) {
        return (
             <div className="text-center">
                 <h2 className="text-3xl font-bold mb-6 text-white">📊 Mi Progreso en Anticipación</h2>
                 <p className="text-slate-400 text-lg">Aún no has completado ninguna sesión. ¡Empieza a entrenar para ver tu progreso!</p>
             </div>
        )
    }

    return (
        <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-br from-white via-slate-300 to-indigo-300 bg-clip-text text-transparent relative pb-4 tracking-tight text-center">
                📊 Mi Progreso en Anticipación
                <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full shadow-[0_0_15px_rgba(102,126,234,0.6)]"></span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard value={totalSessions} label="Sesiones Totales" />
                <StatCard value={`${bestTime}ms`} label="Mejor Tiempo" />
                <StatCard value={`${overallAccuracy}%`} label="Precisión General" />
            </div>

            <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4">Evolución de Precisión</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="date" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" unit="%" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}/>
                        <Legend />
                        <Line type="monotone" dataKey="precision" name="Precisión Promedio" stroke="#818cf8" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
