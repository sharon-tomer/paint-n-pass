// src/components/ActionButtons.tsx

import React from "react";
import { Player } from "../../types";

interface ActionButtonsProps {
  onUndo: () => void;
  onRedo: () => void;
  onEndTurn: () => void;
  canUndo: boolean;
  canRedo: boolean;
  currentPlayer: Player;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onUndo,
  onRedo,
  onEndTurn,
  canUndo,
  canRedo,
  currentPlayer,
}) => {
  const playerColor = currentPlayer === 1 ? "#cf3f3f" : "#6539a0";

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onUndo}
        disabled={!canUndo}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full 
          ${
            canUndo
              ? "bg-gray-200 hover:bg-gray-300"
              : "bg-gray-100 cursor-not-allowed text-gray-400"
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
        aria-label="Undo"
      >
        {/* SVG placeholder - replace with actual SVG */}
        <div className="w-6 h-6 flex items-center justify-center">↩</div>
      </button>

      <button
        onClick={onRedo}
        disabled={!canRedo}
        className={`
          flex items-center justify-center w-10 h-10 rounded-full 
          ${
            canRedo
              ? "bg-gray-200 hover:bg-gray-300"
              : "bg-gray-100 cursor-not-allowed text-gray-400"
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500
        `}
        aria-label="Redo"
      >
        {/* SVG placeholder - replace with actual SVG */}
        <div className="w-6 h-6 flex items-center justify-center">↪</div>
      </button>

      <button
        onClick={onEndTurn}
        className="
          flex items-center justify-center px-4 py-2 rounded-lg
          text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2
          transition-colors duration-200
        "
        style={{ backgroundColor: playerColor }}
        aria-label="End Turn"
      >
        End Turn
      </button>
    </div>
  );
};

export default ActionButtons;
