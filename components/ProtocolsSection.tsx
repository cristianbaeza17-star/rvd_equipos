
import React, { useState } from 'react';

const SportCard: React.FC<{ icon: string; title: string; desc: string; isSelected: boolean; onClick: () => void; }> = ({ icon, title, desc, isSelected, onClick }) => (
    <div onClick={onClick} className={`text-center p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer ${isSelected ? 'border-indigo-500 bg-indigo-500/10 transform -translate-y-1' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-700/50'}`}>
        <div className="text-4xl mb-2">{icon}</div>
        <h4 className="font-bold text-lg text-white">{title}</h4>
        <p className="text-sm text-slate-400">{desc}</p>
    </div>
);

const ProtocolCard: React.FC<{title: string; level: number; duration: string; exercises: string; objective: string;}> = ({title, level, duration, exercises, objective}) => (
    <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 border-l-4 border-l-indigo-500 shadow-lg">
        <div className="flex justify-between items-center mb-3">
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">Nivel {level}</span>
        </div>
        <p className="text-slate-300 mb-1"><strong>Duración:</strong> {duration}</p>
        <p className="text-slate-300 mb-1"><strong>Ejercicios:</strong> {exercises}</p>
        <p className="text-slate-300"><strong>Objetivo:</strong> {objective}</p>
        <button className="mt-4 bg-indigo-600 text-white font-semibold px-5 py-2 rounded-lg hover:bg-indigo-500 transition-colors">Iniciar Protocolo</button>
    </div>
);

export const ProtocolsSection: React.FC = () => {
    const [selectedSport, setSelectedSport] = useState('general');

    const sports = [
        { id: 'futbol', icon: '⚽', title: 'Fútbol', desc: 'Anticipación de pases' },
        { id: 'tenis', icon: '🎾', title: 'Tenis/Raqueta', desc: 'Predicción de rebotes' },
        { id: 'basquet', icon: '🏀', title: 'Básquetbol', desc: 'Anticipación de tiros' },
        { id: 'voleibol', icon: '🏐', title: 'Voleibol', desc: 'Predicción de ataques' },
        { id: 'natacion', icon: '🏊', title: 'Natación', desc: 'Anticipación de virajes' },
        { id: 'general', icon: '🏃', title: 'General', desc: 'Entrenamiento base' },
    ];
    
    return (
        <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-br from-white via-slate-300 to-indigo-300 bg-clip-text text-transparent relative pb-4 tracking-tight text-center">
                📋 Protocolos de Entrenamiento
                <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full shadow-[0_0_15px_rgba(102,126,234,0.6)]"></span>
            </h2>
            <div className="bg-slate-900/30 p-4 rounded-xl text-center mb-8 border border-slate-700">
                <h3 className="text-xl font-semibold text-white mb-2">🎯 Selecciona tu Deporte</h3>
                <p className="text-slate-400">Cada deporte tiene demandas visuales específicas. Selecciona tu disciplina para obtener protocolos personalizados.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                {sports.map(sport => (
                    <SportCard 
                        key={sport.id}
                        {...sport}
                        isSelected={selectedSport === sport.id}
                        onClick={() => setSelectedSport(sport.id)}
                    />
                ))}
            </div>

            <div className="space-y-6">
                <ProtocolCard
                    title="Protocolo Base - Anticipación Básica"
                    level={1}
                    duration="4 semanas, 3 sesiones/semana"
                    exercises="Anticipación de Trayectoria (20 min) con velocidades lentas"
                    objective="Establecer línea base y mejorar predicción básica"
                />
                <ProtocolCard
                    title="Protocolo Intermedio - Anticipación Avanzada"
                    level={2}
                    duration="6 semanas, 4 sesiones/semana"
                    exercises="Anticipación con velocidades variables y trayectorias complejas"
                    objective="Mejorar precisión en condiciones variables"
                />
                 <ProtocolCard
                    title="Protocolo Élite - Anticipación Competitiva"
                    level={3}
                    duration="8 semanas, 5 sesiones/semana"
                    exercises="Anticipación específica por deporte con alta velocidad"
                    objective="Optimización para competición de alto nivel"
                />
            </div>
        </div>
    );
};
