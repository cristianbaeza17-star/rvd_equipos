import React, { useState, useEffect } from 'react';
import type { ChatMessage, GameData } from '../types';
import { generateProfessionalAdvice } from '../services/geminiService';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const ExpertiseTag: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-medium px-4 py-2 rounded-full shadow-md">{children}</span>
);

export const ProfessionalSection: React.FC = () => {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { sender: 'professional', text: "¡Hola! Soy David, tu especialista en entrenamiento de anticipación visual. ¿En qué deporte te especializas? Esto me ayudará a personalizar tu programa." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = async () => {
        if (!input.trim() || isLoading || !currentUser) return;

        const userMessage: ChatMessage = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        
        try {
            const gameData: GameData[] = await apiService.getGameData(currentUser.id);
            const recentPerformance = gameData.slice(-10);

            const aiResponse = await generateProfessionalAdvice(
              [...messages, userMessage],
              recentPerformance
            );

            const professionalMessage: ChatMessage = { sender: 'professional', text: aiResponse };
            setMessages(prev => [...prev, professionalMessage]);
        } catch (error) {
            console.error("Error fetching AI advice:", error);
            const errorMessage: ChatMessage = { sender: 'professional', text: "Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo más tarde." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-br from-white via-slate-300 to-indigo-300 bg-clip-text text-transparent relative pb-4 tracking-tight text-center">
                👨‍⚕️ Asesoría Profesional
                <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full shadow-[0_0_15px_rgba(102,126,234,0.6)]"></span>
            </h2>

            <div className="bg-slate-800/50 rounded-2xl p-6 md:p-8 mb-8 border border-slate-700">
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-[0_16px_32px_rgba(102,126,234,0.4)] border-2 border-white/20 flex-shrink-0">
                        DR
                    </div>
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-white">David Ramírez</h3>
                        <p className="text-indigo-300 font-semibold">Especialista en Entrenamiento de Anticipación Visual</p>
                    </div>
                </div>
                <div className="mt-6 border-t border-slate-700 pt-6">
                    <h4 className="font-semibold text-lg text-white mb-3">⚡ Áreas de Especialización</h4>
                    <div className="flex flex-wrap gap-3">
                        <ExpertiseTag>Anticipación Visual</ExpertiseTag>
                        <ExpertiseTag>Rendimiento Deportivo</ExpertiseTag>
                        <ExpertiseTag>Protocolos de Élite</ExpertiseTag>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/50 rounded-2xl p-4 md:p-6 border border-slate-700">
                <h3 className="text-xl font-bold text-white mb-4 px-2">💬 Chat con tu Especialista</h3>
                <div className="h-80 overflow-y-auto bg-slate-900/50 p-4 rounded-lg space-y-4 mb-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                     {isLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-md p-3 rounded-lg bg-slate-700 text-slate-200">
                                <span className="animate-pulse">Escribiendo...</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex gap-4">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Escribe tu mensaje..."
                        className="flex-grow bg-slate-700 text-white rounded-lg p-3 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        disabled={isLoading}
                    />
                    <button onClick={handleSendMessage} disabled={isLoading || !input.trim()} className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    );
};
