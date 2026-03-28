import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type GameStatus = 'landing' | 'selecting' | 'playing' | 'result';
export type VehicleType = 'bike' | 'scooter';

interface UserData {
  name: string;
  phone: string;
  gender: string;
}

interface GameStats {
  distance: number;
  score: number;
  nearMisses: number;
  speed: number;
}

interface GameState {
  // User & Vehicle
  user: UserData | null;
  vehicle: VehicleType;
  status: GameStatus;
  
  // Stats
  stats: GameStats;
  highScore: number;
  lastWin: boolean;

  // Actions
  setUser: (user: UserData) => void;
  setVehicle: (vehicle: VehicleType) => void;
  setStatus: (status: GameStatus) => void;
  updateStats: (stats: Partial<GameStats>) => void;
  resetStats: () => void;
  checkWin: () => boolean;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      user: null,
      vehicle: 'bike',
      status: 'landing',
      stats: { distance: 0, score: 0, nearMisses: 0, speed: 0 },
      highScore: 0,
      lastWin: false,

      setUser: (user) => set({ user, status: 'selecting' }),
      setVehicle: (vehicle) => set({ vehicle }),
      setStatus: (status) => set({ status }),
      
      updateStats: (newStats) => set((state) => ({
        stats: { ...state.stats, ...newStats }
      })),

      resetStats: () => set({
        stats: { distance: 0, score: 0, nearMisses: 0, speed: 0 },
        lastWin: false
      }),

      checkWin: () => {
        const { stats, highScore } = get();
        const won = stats.score >= 20000; // Win condition based on score threshold
        
        if (stats.score > highScore) {
          set({ highScore: stats.score });
        }
        
        set({ lastWin: won, status: 'result' });
        return won;
      },
    }),
    {
      name: 'yamaha-racing-storage',
      partialize: (state) => ({ 
        user: state.user, 
        highScore: state.highScore 
      }),
    }
  )
);
