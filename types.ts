export interface GameData {
  id: number;
  fecha: string;
  tipoDeEjercicio: string;
  tiempoDeRespuesta: number;
  precision: number;
}

export interface ChatMessage {
  sender: 'user' | 'professional';
  text: string;
}

export interface User {
  id: string;
  username: string;
}

export interface AuthContextType {
  currentUser: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}
