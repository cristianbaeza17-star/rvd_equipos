import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { GameData } from '../types';
import { difficultyConfig, LEVEL_NAMES } from '../constants';
import { StatCard } from './StatCard';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/apiService';

const ControlButton: React.FC<{
    onClick: () => void;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}> = ({ onClick, disabled = false, children, className, style }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        style={style}
        className={`relative uppercase tracking-wider overflow-hidden text-sm text-white px-8 py-4 rounded-full transition-all duration-400 ease-in-out font-semibold border border-white/20 shadow-[0_8px_32px_rgba(102,126,234,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 hover:shadow-[0_20px_40px_rgba(102,126,234,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] hover:transform hover:-translate-y-1 hover:scale-105 disabled:bg-gradient-to-br disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none ${className}`}
    >
        {children}
    </button>
);

export const TrainingSection: React.FC = () => {
    const { currentUser } = useAuth();
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    
    const [gameActive, setGameActive] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [currentSession, setCurrentSession] = useState<GameData[]>([]);
    const [exerciseMode, setExerciseMode] = useState<'time' | 'reps'>('time');
    const [difficulty, setDifficulty] = useState<number>(3);
    
    const [timeSelection, setTimeSelection] = useState<number>(60);
    const [repsSelection, setRepsSelection] = useState<number>(10);

    const [timeLeft, setTimeLeft] = useState(60);
    const [repsDone, setRepsDone] = useState(0);

    const [countdown, setCountdown] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const [score, setScore] = useState(0);
    const [avgResponse, setAvgResponse] = useState(0);
    const [accuracy, setAccuracy] = useState(0);
    const [consecutiveHits, setConsecutiveHits] = useState(0);

    const gameActiveRef = useRef(gameActive);
    useEffect(() => { gameActiveRef.current = gameActive; }, [gameActive]);
    const isPausedRef = useRef(isPaused);
    useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
    
    const waitingForClickRef = useRef(false);
    const ballDataRef = useRef<any>(null);
    const targetPositionRef = useRef<{ x: number, y: number } | null>(null);

    const showFeedback = (message: string, type: 'success' | 'error') => {
        setFeedback({ message, type });
        setTimeout(() => setFeedback(null), 3000);
    };
    
    const drawWelcomeMessage = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#667eea';
        ctx.font = '24px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Presiona "Iniciar Entrenamiento" para comenzar', canvas.width / 2, canvas.height / 2);
    }, []);

    useEffect(() => {
        drawWelcomeMessage();
    }, [drawWelcomeMessage]);

    const stopExercise = useCallback(async () => {
        setGameActive(false);
        setIsPaused(false);
        if (animationFrameId.current) {
            cancelAnimationFrame(animationFrameId.current);
        }

        if (currentSession.length > 0 && currentUser) {
            await apiService.saveGameData(currentUser.id, currentSession);
            const avgPrecision = Math.round(currentSession.reduce((sum, data) => sum + data.precision, 0) / currentSession.length);
            showFeedback(`Sesión guardada! Precisión promedio: ${avgPrecision}%`, 'success');
        }

        drawWelcomeMessage();
    }, [currentSession, currentUser, drawWelcomeMessage]);


    useEffect(() => {
        if (!gameActive || isPaused || exerciseMode !== 'time') return;
        if (timeLeft <= 0) {
            stopExercise();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [gameActive, isPaused, timeLeft, exerciseMode, stopExercise]);
    
    const startBallAnimation = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const config = difficultyConfig[difficulty as keyof typeof difficultyConfig];
        const targetZoneX = canvas.width - 50;
        const targetZoneWidth = config.targetZoneWidth;
        const destinationX = targetZoneX + targetZoneWidth / 2;
        
        const ballRadius = config.ballRadius;
        const ballSpeed = config.ballSpeed.min + Math.random() * (config.ballSpeed.max - config.ballSpeed.min);
        const trajectoryType = config.trajectoryTypes[Math.floor(Math.random() * config.trajectoryTypes.length)];
        
        let ballStartY, ballEndY, ballVelocityY = 0;
        
        switch(trajectoryType) {
            case 'horizontal':
                ballStartY = (canvas.height * 0.3) + (Math.random() * canvas.height * 0.4);
                ballEndY = ballStartY;
                break;
            case 'diagonal_up':
                ballStartY = canvas.height * 0.7 + (Math.random() * canvas.height * 0.2);
                ballEndY = canvas.height * 0.2 + (Math.random() * canvas.height * 0.2);
                ballVelocityY = (ballEndY - ballStartY) / (destinationX / ballSpeed);
                break;
            case 'diagonal_down':
                ballStartY = canvas.height * 0.2 + (Math.random() * canvas.height * 0.2);
                ballEndY = canvas.height * 0.7 + (Math.random() * canvas.height * 0.2);
                ballVelocityY = (ballEndY - ballStartY) / (destinationX / ballSpeed);
                break;
            case 'curved_up':
                ballStartY = canvas.height * 0.6 + (Math.random() * canvas.height * 0.3);
                ballEndY = canvas.height * 0.2 + (Math.random() * canvas.height * 0.3);
                break;
            case 'curved_down':
                ballStartY = canvas.height * 0.2 + (Math.random() * canvas.height * 0.3);
                ballEndY = canvas.height * 0.6 + (Math.random() * canvas.height * 0.3);
                break;
        }
        
        let ballX = ballRadius;
        let ballY = ballStartY;
        let ballVisible = true;
        const hidePoint = canvas.width * config.hidePoint;
        
        ballDataRef.current = {
            x: ballX, y: ballY, startY: ballStartY, endY: ballEndY, speed: ballSpeed,
            velocityY: ballVelocityY, radius: ballRadius, trajectoryType: trajectoryType,
        };

        const animate = () => {
            if (!gameActiveRef.current || isPausedRef.current) {
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#667eea';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 5]);
            ctx.strokeRect(targetZoneX, 0, targetZoneWidth, canvas.height);
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 16px Inter, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(LEVEL_NAMES[difficulty as keyof typeof LEVEL_NAMES], 20, 30);
            
            ballX += ballSpeed;
            const progress = ballX / canvas.width;

            switch(trajectoryType) {
                case 'horizontal': ballY = ballStartY; break;
                case 'diagonal_up': case 'diagonal_down': ballY += ballVelocityY; break;
                case 'curved_up': ballY = ballStartY + (ballEndY - ballStartY) * Math.sin(progress * Math.PI * 0.8); break;
                case 'curved_down': ballY = ballStartY + (ballEndY - ballStartY) * (1 - Math.cos(progress * Math.PI * 0.8)); break;
            }
            ballDataRef.current = { ...ballDataRef.current, x: ballX, y: ballY };

            if (ballX >= hidePoint && ballVisible) {
                ballVisible = false;
                waitingForClickRef.current = true;
                ballDataRef.current.hideTime = performance.now();
                
                let finalY;
                const finalProgress = destinationX / canvas.width;
                 switch(trajectoryType) {
                    case 'horizontal': finalY = ballY; break;
                    case 'diagonal_up': case 'diagonal_down':
                        const remainingDist = destinationX - ballX;
                        const timeToTarget = remainingDist / ballSpeed;
                        finalY = ballY + ballVelocityY * timeToTarget;
                        break;
                    case 'curved_up': finalY = ballStartY + (ballEndY - ballStartY) * Math.sin(finalProgress * Math.PI * 0.8); break;
                    case 'curved_down': finalY = ballStartY + (ballEndY - ballStartY) * (1 - Math.cos(finalProgress * Math.PI * 0.8)); break;
                }
                finalY = Math.max(ballRadius, Math.min(canvas.height - ballRadius, finalY!));
                targetPositionRef.current = { x: destinationX, y: finalY };
            }

            if (ballVisible) {
                const grad = ctx.createRadialGradient(ballX - 3, ballY - 3, 0, ballX, ballY, ballRadius);
                grad.addColorStop(0, '#ff6b6b'); grad.addColorStop(1, '#e53e3e');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
                ctx.fill();
            }

            if (ballVisible && ballX < canvas.width + ballRadius) {
                animationFrameId.current = requestAnimationFrame(animate);
            }
        };
        animationFrameId.current = requestAnimationFrame(animate);
    }, [difficulty]);
    
    const handleCanvasClick = useCallback((event: MouseEvent) => {
        if (!gameActiveRef.current || !waitingForClickRef.current || !targetPositionRef.current) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (event.clientX - rect.left) * scaleX;
        const clickY = (event.clientY - rect.top) * scaleY;
        
        const responseTime = performance.now() - ballDataRef.current.hideTime;
        const distance = Math.sqrt(Math.pow(clickX - targetPositionRef.current.x, 2) + Math.pow(clickY - targetPositionRef.current.y, 2));

        const config = difficultyConfig[difficulty as keyof typeof difficultyConfig];
        const precision = Math.max(0, 100 - (distance / (config.targetZoneWidth * 2)) * 100);

        const newHit = precision >= 75;
        const newConsecutiveHits = newHit ? consecutiveHits + 1 : 0;
        setConsecutiveHits(newConsecutiveHits);

        const sessionData: GameData = {
            id: Date.now(),
            fecha: new Date().toLocaleString(),
            tipoDeEjercicio: 'Anticipación de Trayectoria',
            tiempoDeRespuesta: Math.round(responseTime),
            precision: Math.round(precision),
        };
        setCurrentSession(prev => [...prev, sessionData]);
        
        waitingForClickRef.current = false;
        
        const ctx = canvas.getContext('2d');
        if(ctx) {
            ctx.fillStyle = newHit ? 'rgba(72, 187, 120, 0.4)' : 'rgba(245, 101, 101, 0.4)';
            ctx.beginPath();
            ctx.arc(clickX, clickY, 20, 0, 2*Math.PI);
            ctx.fill();

            setTimeout(() => {
                ctx.fillStyle = '#ff6b6b';
                ctx.beginPath();
                ctx.arc(targetPositionRef.current!.x, targetPositionRef.current!.y, ballDataRef.current.radius, 0, 2 * Math.PI);
                ctx.fill();

                setTimeout(() => {
                    if (exerciseMode === 'reps') {
                        if (repsDone + 1 >= repsSelection) {
                            stopExercise();
                            return;
                        }
                        setRepsDone(r => r + 1);
                    }
                    if(gameActiveRef.current) startBallAnimation();
                }, 1500);
            }, 500);
        }
    }, [difficulty, consecutiveHits, repsDone, repsSelection, exerciseMode, startBallAnimation, stopExercise]);
    
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.addEventListener('click', handleCanvasClick);
        return () => canvas.removeEventListener('click', handleCanvasClick);
    }, [handleCanvasClick]);

    useEffect(() => {
        if (currentSession.length === 0) {
            setScore(0);
            setAvgResponse(0);
            setAccuracy(0);
            return;
        }
        const totalScore = currentSession.reduce((sum, data) => sum + data.precision, 0);
        const avgResp = currentSession.reduce((sum, data) => sum + data.tiempoDeRespuesta, 0) / currentSession.length;
        const acc = totalScore / currentSession.length;
        setScore(Math.round(totalScore));
        setAvgResponse(Math.round(avgResp));
        setAccuracy(Math.round(acc));
    }, [currentSession]);
    
    const startExercise = () => {
        setCurrentSession([]);
        setConsecutiveHits(0);
        
        if (exerciseMode === 'time') setTimeLeft(timeSelection);
        else setRepsDone(0);

        setCountdown(3);
        const countdownInterval = setInterval(() => {
            setCountdown(prev => {
                if (prev !== null && prev > 1) return prev - 1;
                clearInterval(countdownInterval);
                setCountdown(null);
                setGameActive(true);
                setIsPaused(false);
                return null;
            });
        }, 1000);
    };

    useEffect(() => {
        if (gameActive && !isPaused) {
            startBallAnimation();
        }

        return () => {
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [gameActive, isPaused, startBallAnimation]);

    const togglePause = () => setIsPaused(!isPaused);
    
    return (
        <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-br from-white via-slate-300 to-indigo-300 bg-clip-text text-transparent relative pb-4 tracking-tight">
                🎯 Entrenamiento de Anticipación
                <span className="absolute -bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent rounded-full shadow-[0_0_15px_rgba(102,126,234,0.6)]"></span>
            </h2>
            
            <div className="bg-slate-900/50 p-6 rounded-2xl mb-6 border border-slate-700">
                <div className="flex justify-center gap-2 mb-4">
                    <button onClick={() => setExerciseMode('time')} className={`px-4 py-2 rounded-full font-semibold transition-colors ${exerciseMode === 'time' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>Por Tiempo</button>
                    <button onClick={() => setExerciseMode('reps')} className={`px-4 py-2 rounded-full font-semibold transition-colors ${exerciseMode === 'reps' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>Por Repeticiones</button>
                </div>
                <div className="flex flex-col md:flex-row justify-center items-center gap-6 text-slate-300">
                    {exerciseMode === 'time' ? (
                        <div>
                            <label htmlFor="exerciseTime" className="mr-2">Duración:</label>
                            <select id="exerciseTime" value={timeSelection} onChange={e => setTimeSelection(Number(e.target.value))} className="bg-slate-800 border border-slate-600 rounded-md p-2">
                                <option value="30">30 seg</option><option value="60">1 min</option><option value="90">1.5 min</option>
                            </select>
                        </div>
                    ) : (
                         <div>
                            <label htmlFor="exerciseReps" className="mr-2">Repeticiones:</label>
                            <select id="exerciseReps" value={repsSelection} onChange={e => setRepsSelection(Number(e.target.value))} className="bg-slate-800 border border-slate-600 rounded-md p-2">
                                <option value="10">10</option><option value="20">20</option><option value="30">30</option>
                            </select>
                        </div>
                    )}
                    <div>
                        <label htmlFor="difficulty" className="mr-2">Dificultad:</label>
                        <select id="difficulty" value={difficulty} onChange={e => setDifficulty(Number(e.target.value))} className="bg-slate-800 border border-slate-600 rounded-md p-2">
                            <option value="1">Nivel 1 🟢</option><option value="2">Nivel 2 🔵</option><option value="3">Nivel 3 🟡</option><option value="4">Nivel 4 🟠</option><option value="5">Nivel 5 🔴</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="relative">
                <canvas ref={canvasRef} width="1000" height="600" className="w-full h-auto rounded-2xl border-2 border-indigo-400/60 bg-gradient-to-br from-[#0f0f23] to-[#1a1a2e] cursor-crosshair shadow-[0_20px_60px_rgba(0,0,0,0.6)]"></canvas>
                {countdown && <div className="absolute inset-0 flex items-center justify-center text-8xl font-bold text-white bg-black/50">{countdown}</div>}
            </div>

            <div className="mt-6 flex justify-center gap-4">
                <ControlButton onClick={startExercise} disabled={gameActive}>🚀 Iniciar</ControlButton>
                <ControlButton onClick={togglePause} disabled={!gameActive}>{isPaused ? '▶️ Reanudar' : '⏸️ Pausar'}</ControlButton>
                <ControlButton onClick={stopExercise} disabled={!gameActive}>⏹️ Detener</ControlButton>
            </div>
            
            {gameActive && (
                <div className="mt-4">
                    {exerciseMode === 'time' && (
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(timeLeft / timeSelection) * 100}%` }}></div>
                        </div>
                    )}
                     {exerciseMode === 'reps' && (
                        <div className="w-full bg-slate-700 rounded-full h-2.5">
                            <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(repsDone / repsSelection) * 100}%` }}></div>
                        </div>
                    )}
                    <div className="text-lg font-semibold mt-2">
                        {exerciseMode === 'time' ? `Tiempo: ${timeLeft}s` : `Repeticiones: ${repsDone}/${repsSelection}`}
                    </div>
                </div>
            )}
             {feedback && <div className={`mt-4 p-3 rounded-lg font-bold text-center ${feedback.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{feedback.message}</div>}


            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mt-8">
                <StatCard value={score} label="Puntuación Total" />
                <StatCard value={`${avgResponse}ms`} label="Tiempo Promedio" />
                <StatCard value={`${accuracy}%`} label="Precisión" />
                <StatCard value={consecutiveHits} label="Aciertos Consecutivos" />
            </div>
        </div>
    );
};
