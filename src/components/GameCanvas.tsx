import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/Engine';
import { useGameStore } from '../store/useGameStore';

interface GameCanvasProps {
  onGameOver: (stats: any) => void;
  onWin: () => void;
  vehicle: string;
}

const GameCanvas: React.FC<GameCanvasProps> = React.memo(({ onGameOver, onWin, vehicle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const engineStartedRef = useRef<string | null>(null);

  useEffect(() => {
    if (canvasRef.current && engineStartedRef.current !== vehicle) {
      const canvas = canvasRef.current;
      
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      
      window.addEventListener('resize', resize);
      resize();

      // Clear old engine if exists
      if (engineRef.current) {
        (engineRef.current as any).canvas = null;
      }

      // Initialize engine with store
      const engine = new GameEngine(
        canvas, 
        onGameOver, 
        onWin, 
        vehicle,
        useGameStore 
      );
      engineRef.current = engine;
      engineStartedRef.current = vehicle;
      engine.start();

      return () => {
        window.removeEventListener('resize', resize);
        if (engineRef.current) {
          engineRef.current.stop();
          engineRef.current = null;
        }
        engineStartedRef.current = null;
      };
    }
  }, [onGameOver, onWin, vehicle]);

  return (
    <canvas 
      ref={canvasRef} 
      className="w-full h-full block bg-black"
    />
  );
});

export default GameCanvas;
