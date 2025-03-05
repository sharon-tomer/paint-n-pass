// src/components/InkIndicator.tsx

import React from "react";
import { Player } from "../../types";

interface InkIndicatorProps {
  inkUsed: number;
  inkLimit: number;
  player: Player;
}

const InkIndicator: React.FC<InkIndicatorProps> = ({
  inkUsed,
  inkLimit,
  player,
}) => {
  const percentage = Math.min(100, (inkUsed / inkLimit) * 100);
  const playerColor = player === 1 ? "#cf3f3f" : "#6539a0";

  // Determine color based on remaining ink
  let fillColor = playerColor;
  let textClass = "text-gray-800";

  if (percentage > 80) {
    fillColor = "#ef4444"; // Red for low ink
    textClass = "text-red-600 font-semibold";
  }

  return (
    <div className="w-full px-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Ink</span>
        <span className={`text-sm font-medium ${textClass}`}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: fillColor,
          }}
        ></div>
      </div>

      {percentage > 90 && (
        <p className="text-xs text-red-600 mt-1">Almost out of ink!</p>
      )}
    </div>
  );
};

export default InkIndicator;
