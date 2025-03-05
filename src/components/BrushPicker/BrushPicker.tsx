// src/components/BrushPicker.tsx

import React, { useState } from "react";
import { BrushSettings } from "../../types";

interface BrushPickerProps {
  brushSettings: BrushSettings;
  onBrushChange: (settings: BrushSettings) => void;
}

const BrushPicker: React.FC<BrushPickerProps> = ({
  brushSettings,
  onBrushChange,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBrushChange({ ...brushSettings, color: e.target.value });
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onBrushChange({ ...brushSettings, width: Number(e.target.value) });
  };

  const togglePicker = () => {
    setShowPicker(!showPicker);
  };

  // Predefined color palette
  const predefinedColors = [
    "#cf3f3f", // Player 1 default
    "#6539a0", // Player 2 default
    "#000000", // Black
    "#333333", // Dark gray
    "#2D9CDB", // Blue
    "#27AE60", // Green
    "#F2C94C", // Yellow
    "#F2994A", // Orange
  ];

  // Predefined brush widths
  const predefinedWidths = [1, 3, 5, 8, 12, 16, 20];

  return (
    <div className="relative">
      <button
        onClick={togglePicker}
        className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ backgroundColor: brushSettings.color }}
        aria-label="Open brush settings"
      >
        <div
          className="rounded-full bg-white"
          style={{
            width: `${brushSettings.width}px`,
            height: `${brushSettings.width}px`,
            opacity: 0.7,
          }}
        ></div>
      </button>

      {showPicker && (
        <div className="absolute left-0 top-16 bg-white p-4 rounded-lg shadow-lg z-10 border border-gray-300 w-64">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {predefinedColors.map((color) => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full ${
                    color === brushSettings.color ? "ring-2 ring-blue-500" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => onBrushChange({ ...brushSettings, color })}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <input
              type="color"
              value={brushSettings.color}
              onChange={handleColorChange}
              className="w-full h-8 cursor-pointer"
              aria-label="Custom color picker"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width: {brushSettings.width}px
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {predefinedWidths.map((width) => (
                <button
                  key={width}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 ${
                    width === brushSettings.width ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => onBrushChange({ ...brushSettings, width })}
                  aria-label={`Select brush width ${width}px`}
                >
                  <div
                    className="rounded-full bg-black"
                    style={{ width: `${width}px`, height: `${width}px` }}
                  ></div>
                </button>
              ))}
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={brushSettings.width}
              onChange={handleWidthChange}
              className="w-full"
              aria-label="Custom brush width"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowPicker(false)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrushPicker;
