
import React from 'react';

export const InfoModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 text-slate-200 rounded-2xl max-w-2xl w-full p-8 border border-slate-700 shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-3xl text-slate-400 hover:text-white">&times;</button>
                <h2 className="text-2xl font-bold mb-4 text-white">🎯 RVD - Anticipación de Trayectoria</h2>
                <div className="space-y-4 text-slate-300">
                    <div>
                        <h3 className="font-semibold text-lg text-indigo-300">Enfoque Especializado en Anticipación</h3>
                        <p>La anticipación de trayectoria es crucial. Los atletas de élite no son solo más rápidos; son mejores para predecir. Esta aplicación se centra exclusivamente en perfeccionar esta habilidad.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg text-indigo-300">Metodología Basada en Evidencia</h3>
                        <p>Entrenamos al cerebro para procesar información visual y predecir trayectorias con mayor precisión y velocidad. Las mejoras aquí se transfieren directamente a tu rendimiento deportivo.</p>
                    </div>
                     <div>
                        <h3 className="font-semibold text-lg text-indigo-300">Supervisión Especializada</h3>
                        <p>El entrenamiento de anticipación requiere supervisión experta para diseñar protocolos específicos, ajustar la dificultad y maximizar la transferencia al rendimiento real.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
