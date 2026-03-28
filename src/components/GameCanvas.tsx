import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/Engine';
import { useGameStore } from '../store/useGameStore';

interface GameCanvasProps {
  onGameOver: (stats: any) => void;
  vehicle: string;
  isPaused: boolean;
}

const GameCanvas: React.FC<GameCanvasProps> = React.memo(({ onGameOver, vehicle, isPaused }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const engineStartedRef = useRef<string | null>(null);

  useEffect(() => {
    if (canvasRef.current && engineStartedRef.current !== vehicle) {
      const canvas = canvasRef.current;
      
      const updateCanvasSize = () => {
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = window.innerWidth;
        const displayHeight = window.innerHeight;

        // Set the internal resolution (DPR aware)
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;

        // Set the CSS display size
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        if (engineRef.current) {
          (engineRef.current as any).handleResize(canvas.width, canvas.height);
        }
      };
      
      window.addEventListener('resize', updateCanvasSize);
      updateCanvasSize();

      // Clear old engine if exists
      if (engineRef.current) {
        engineRef.current.stop();
      }

      // Initialize engine
      const engine = new GameEngine(
        canvas, 
        onGameOver, 
        vehicle,
        useGameStore 
      );
      engineRef.current = engine;
      engine.isPaused = isPaused;
      engineStartedRef.current = vehicle;
      engine.start();

      return () => {
        window.removeEventListener('resize', updateCanvasSize);
        if (engineRef.current) {
          engineRef.current.stop();
          engineRef.current = null;
        }
        engineStartedRef.current = null;
      };
    }
  }, [onGameOver, vehicle]);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.isPaused = isPaused;
    }
  }, [isPaused]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full block bg-black touch-none overflow-hidden"
    />
  );
});

export default GameCanvas;
