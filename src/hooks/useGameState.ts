// src/hooks/useGameState.ts

import { useReducer, useEffect, useCallback } from "react";
import { GameState, GameAction, Player, BrushSettings, Stroke } from "../types";
import { calculateInkLimit, calculateStrokeDistance } from "../utils/ink";

const initialBrushSettings: Record<Player, BrushSettings> = {
  1: { color: "#cf3f3f", width: 5 },
  2: { color: "#6539a0", width: 5 },
};

const initialGameState = (
  canvasWidth: number,
  canvasHeight: number,
  gameId: string
): GameState => {
  const inkLimit = calculateInkLimit(canvasWidth, canvasHeight);

  return {
    currentPlayer: 1,
    currentTurn: 1,
    turns: [
      {
        player: 1,
        turnNumber: 1,
        strokes: [],
        inkUsed: 0,
        inkLimit,
        brushSettings: initialBrushSettings[1],
      },
    ],
    isGameOver: false,
    canvasWidth,
    canvasHeight,
    inkLimit,
    gameId,
  };
};

const gameReducer = (state: GameState, action: GameAction): GameState => {
  switch (action.type) {
    case "START_GAME": {
      const { canvasWidth, canvasHeight, gameId } = action.payload;
      return initialGameState(canvasWidth, canvasHeight, gameId);
    }

    case "SET_BRUSH": {
      const currentTurn = state.turns[state.currentTurn - 1];
      return {
        ...state,
        turns: [
          ...state.turns.slice(0, state.currentTurn - 1),
          {
            ...currentTurn,
            brushSettings: action.payload,
          },
          ...state.turns.slice(state.currentTurn),
        ],
      };
    }

    case "ADD_STROKE": {
      const { path, color, width } = action.payload;
      const currentTurn = state.turns[state.currentTurn - 1];

      const newStroke: Stroke = {
        path,
        color,
        width,
        player: state.currentPlayer,
        turnNumber: state.currentTurn,
      };

      return {
        ...state,
        turns: [
          ...state.turns.slice(0, state.currentTurn - 1),
          {
            ...currentTurn,
            strokes: [...currentTurn.strokes, newStroke],
          },
          ...state.turns.slice(state.currentTurn),
        ],
      };
    }

    case "UPDATE_INK": {
      const { amount } = action.payload;
      const currentTurn = state.turns[state.currentTurn - 1];
      const newInkUsed = currentTurn.inkUsed + amount;

      return {
        ...state,
        turns: [
          ...state.turns.slice(0, state.currentTurn - 1),
          {
            ...currentTurn,
            inkUsed: newInkUsed,
          },
          ...state.turns.slice(state.currentTurn),
        ],
      };
    }

    case "UNDO": {
      const currentTurn = state.turns[state.currentTurn - 1];
      if (currentTurn.strokes.length === 0) return state;

      const updatedStrokes = [...currentTurn.strokes];
      const removedStroke = updatedStrokes.pop();

      if (!removedStroke) return state;

      // Recalculate ink used
      const inkUsed =
        currentTurn.inkUsed -
        calculateStrokeDistance(removedStroke.path) * removedStroke.width;

      return {
        ...state,
        turns: [
          ...state.turns.slice(0, state.currentTurn - 1),
          {
            ...currentTurn,
            strokes: updatedStrokes,
            inkUsed: Math.max(0, inkUsed),
          },
          ...state.turns.slice(state.currentTurn),
        ],
      };
    }

    case "REDO": {
      // We're not implementing redo for simplicity
      return state;
    }

    case "END_TURN": {
      const nextPlayer = state.currentPlayer === 1 ? 2 : 1;
      const nextTurn = state.currentTurn + 1;

      // Find the last turn by this player to get their brush settings
      const lastPlayerTurn = [...state.turns]
        .reverse()
        .find((turn) => turn.player === nextPlayer);

      const brushSettings = lastPlayerTurn
        ? lastPlayerTurn.brushSettings
        : initialBrushSettings[nextPlayer];

      return {
        ...state,
        currentPlayer: nextPlayer,
        currentTurn: nextTurn,
        turns: [
          ...state.turns,
          {
            player: nextPlayer,
            turnNumber: nextTurn,
            strokes: [],
            inkUsed: 0,
            inkLimit: state.inkLimit,
            brushSettings,
          },
        ],
      };
    }

    case "SET_GAME_STATE": {
      return action.payload;
    }

    default:
      return state;
  }
};

export const useGameState = (
  canvasWidth: number,
  canvasHeight: number,
  gameId: string
) => {
  const [state, dispatch] = useReducer(
    gameReducer,
    initialGameState(canvasWidth, canvasHeight, gameId)
  );

  // Check if turn should end due to ink limit
  useEffect(() => {
    const currentTurn = state.turns[state.currentTurn - 1];
    if (currentTurn && currentTurn.inkUsed >= currentTurn.inkLimit) {
      // Small delay to make it feel more natural
      const timer = setTimeout(() => {
        dispatch({ type: "END_TURN" });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [state.turns, state.currentTurn]);

  const getAllStrokes = useCallback(() => {
    return state.turns.flatMap((turn) => turn.strokes);
  }, [state.turns]);

  return {
    state,
    dispatch,
    getAllStrokes,
  };
};
