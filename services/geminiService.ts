import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, GameData } from '../types';

let ai: GoogleGenAI | null = null;
const apiKey = process.env.API_KEY;

if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
} else {
    console.warn("Advertencia: La variable de entorno API_KEY de Gemini no está configurada. La asesoría profesional no funcionará.");
}

const getAiClient = (): GoogleGenAI => {
    if (!ai) {
        throw new Error("El servicio de IA no está configurado. Por favor, contacta al administrador.");
    }
    return ai;
}

export const generateProfessionalAdvice = async (
    chatHistory: ChatMessage[], 
    performanceData: GameData[]
): Promise<string> => {
    try {
        const aiClient = getAiClient();
        const model = 'gemini-2.5-flash';

        const systemInstruction = `
            Eres David Ramírez, un Tecnólogo Médico en Oftalmología y Optometría, y un especialista de élite en entrenamiento visual deportivo, específicamente en la anticipación de trayectorias. Tu tono es profesional, alentador y basado en datos.
            - Analiza el rendimiento reciente del usuario que te proporcionaré.
            - Ofrece consejos concisos y prácticos basados en sus datos de precisión y tiempo de respuesta.
            - Relaciona tus consejos con el deporte que el usuario mencione.
            - Mantén tus respuestas breves, como en un chat, idealmente de 2 a 4 frases. No uses markdown.
            - Si los datos de rendimiento están vacíos, anímale a completar algunas sesiones primero.
        `;
        
        let performanceSummary = "El usuario no tiene datos de rendimiento recientes.";
        if (performanceData.length > 0) {
            const avgPrecision = performanceData.reduce((acc, item) => acc + item.precision, 0) / performanceData.length;
            const avgResponseTime = performanceData.reduce((acc, item) => acc + item.tiempoDeRespuesta, 0) / performanceData.length;
            performanceSummary = `
                Datos de rendimiento recientes del usuario (últimas ${performanceData.length} jugadas):
                - Precisión promedio: ${avgPrecision.toFixed(2)}%
                - Tiempo de respuesta promedio: ${avgResponseTime.toFixed(2)}ms
            `;
        }

        const userPrompt = `
            Historial de chat:
            ${chatHistory.map(msg => `${msg.sender === 'user' ? 'Usuario' : 'Tú'}: ${msg.text}`).join('\n')}

            ${performanceSummary}

            Basado en todo lo anterior, proporciona tu siguiente respuesta en el chat.
        `;

        const response = await aiClient.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
        });

        return response.text;
    } catch (error: any) {
        console.error("Gemini service error:", error);
        return error.message || "Lo siento, no pude procesar tu solicitud en este momento. Inténtalo de nuevo.";
    }
};