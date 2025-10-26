import { GoogleGenAI } from "@google/genai";
import type { ChatMessage, GameData } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set for Gemini. AI features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateProfessionalAdvice = async (
    chatHistory: ChatMessage[], 
    performanceData: GameData[]
): Promise<string> => {
    if (!ai) {
        return "El servicio de IA no está configurado. Por favor, asegúrate de que la API key esté disponible.";
    }

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

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API error:", error);
        return "Lo siento, no pude procesar tu solicitud en este momento. Inténtalo de nuevo.";
    }
};
