// src/types/index.ts

export type Player = 1 | 2;

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  path: Point[];
  color: string;
  width: number;
  player: Player;
  turnNumber: number;
}

export interface BrushSettings {
  color: string;
  width: number;
}

export interface Turn {
  player: Player;
  turnNumber: number;
  strokes: Stroke[];
  inkUsed: number;
  inkLimit: number;
  brushSettings: BrushSettings;
}

export interface GameState {
  currentPlayer: Player;
  currentTurn: number;
  turns: Turn[];
  isGameOver: boolean;
  canvasWidth: number;
  canvasHeight: number;
  inkLimit: number; // 10% of canvas area
  gameId: string;
}

export type GameAction =
  | {
      type: "START_GAME";
      payload: { canvasWidth: number; canvasHeight: number; gameId: string };
    }
  | { type: "END_TURN" }
  | {
      type: "ADD_STROKE";
      payload: { path: Point[]; color: string; width: number };
    }
  | { type: "UPDATE_INK"; payload: { amount: number } }
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "SET_BRUSH"; payload: BrushSettings }
  | { type: "SET_GAME_STATE"; payload: GameState };
