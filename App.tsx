import React, { useState, useEffect } from 'react';
import { TrainingSection } from './components/TrainingSection';
import { ProtocolsSection } from './components/ProtocolsSection';
import { ProfessionalSection } from './components/ProfessionalSection';
import { ProgressSection } from './components/ProgressSection';
import { InfoModal } from './components/InfoModal';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { apiService } from './services/apiService';

const Particles = () => {
    const [particles, setParticles] = useState<React.ReactNode[]>([]);

    useEffect(() => {
        const createParticles = () => {
            const newParticles = Array.from({ length: 50 }).map((_, i) => {
                const style = {
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 3 + 1}px`,
                    height: `${Math.random() * 3 + 1}px`,
                    animationDelay: `${Math.random() * 6}s`,
                    '--hue': `${220 + Math.random() * 60}`,
                } as React.CSSProperties;
                return <div key={i} className="absolute rounded-full bg-[hsla(var(--hue),70%,60%,0.6)] animate-float" style={style}></div>;
            });
            setParticles(newParticles);
        };
        createParticles();
    }, []);

    return <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[1]">{particles}</div>;
};

const NavButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`relative overflow-hidden backdrop-blur-xl text-white px-8 py-4 rounded-full transition-all duration-400 ease-in-out font-medium border border-white/20 text-base shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.2)] hover:transform hover:-translate-y-1 hover:scale-105 before:content-[''] before:absolute before:top-0 before:left-[-100%] before:w-full before:h-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:transition-all before:duration-700 hover:before:left-full ${
      isActive
        ? 'bg-gradient-to-br from-indigo-500/40 to-purple-600/40 border-indigo-400/60 shadow-[0_20px_40px_rgba(102,126,234,0.4),inset_0_1px_0_rgba(255,255,255,0.3)] transform -translate-y-1 scale-102'
        : 'bg-gradient-to-br from-white/10 to-white/5'
    }`}
  >
    {label}
  </button>
);


export default function App() {
    const { currentUser, logout } = useAuth();
    const [activeSection, setActiveSection] = useState('training');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const exportData = async () => {
        if (!currentUser) return;
        const gameData = await apiService.getGameData(currentUser.id);
        if (gameData.length === 0) {
            alert('No hay datos para exportar');
            return;
        }
        const dataStr = JSON.stringify(gameData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `rvd-${currentUser.username}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!currentUser) {
        return (
            <div className="relative min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] bg-fixed flex items-center justify-center p-4">
                 <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
                        10% { opacity: 1; }
                        90% { opacity: 1; }
                        50% { transform: translateY(-100px) rotate(180deg); }
                    }
                    .animate-float { animation: float 6s ease-in-out infinite; }
                `}</style>
                <Particles />
                <Auth />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] bg-fixed">
            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    50% { transform: translateY(-100px) rotate(180deg); }
                }
                .animate-float { animation: float 6s ease-in-out infinite; }
            `}</style>
            <Particles />
             <div className="fixed top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(120,119,198,0.2)_0%,transparent_40%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.1)_0%,transparent_40%)] pointer-events-none"></div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <header className="text-center mb-12 relative py-10">
                    <div className="absolute inset-0 top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/30 rounded-full filter blur-3xl -z-10"></div>
                    <div className="text-2xl font-semibold mb-2 text-white tracking-wider">RVD Entrenamientos</div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-5 tracking-tighter relative text-shadow-[0_0_40px_rgba(102,126,234,0.5)]">
                        🎯 Anticipación de Trayectoria
                         <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-28 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full shadow-[0_0_20px_rgba(102,126,234,0.8)]"></span>
                    </h1>
                    <p className="text-xl font-light text-slate-300 tracking-wide">Bienvenido, {currentUser.username}</p>
                    <button onClick={() => setIsModalOpen(true)} className="absolute top-1/2 -translate-y-1/2 right-0 md:right-10 text-white bg-gradient-to-br from-indigo-500 to-purple-600 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-[0_8px_32px_rgba(102,126,234,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] border border-white/20 transition-all duration-300 hover:scale-110 hover:rotate-[360deg] hover:shadow-[0_16px_40px_rgba(102,126,234,0.6)]">
                        i
                    </button>
                </header>
                
                <nav className="flex justify-center flex-wrap gap-4 mb-8">
                    <NavButton label="Entrenamiento" isActive={activeSection === 'training'} onClick={() => setActiveSection('training')} />
                    <NavButton label="Protocolos" isActive={activeSection === 'protocols'} onClick={() => setActiveSection('protocols')} />
                    <NavButton label="Asesoría Pro" isActive={activeSection === 'professional'} onClick={() => setActiveSection('professional')} />
                    <NavButton label="Mi Progreso" isActive={activeSection === 'progress'} onClick={() => setActiveSection('progress')} />
                    <NavButton label="Exportar Datos" isActive={false} onClick={exportData} />
                    <NavButton label="Cerrar Sesión" isActive={false} onClick={logout} />
                </nav>

                <main>
                    <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 p-6 sm:p-12 rounded-3xl border border-white/10 shadow-[0_32px_64px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.2),0_0_0_1px_rgba(255,255,255,0.1)]">
                       {activeSection === 'training' && <TrainingSection />}
                       {activeSection === 'protocols' && <ProtocolsSection />}
                       {activeSection === 'professional' && <ProfessionalSection />}
                       {activeSection === 'progress' && <ProgressSection />}
                    </div>
                </main>
            </div>
            <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
}
