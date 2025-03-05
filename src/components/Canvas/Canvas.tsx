// src/components/Canvas.tsx
import React, { useRef, useEffect, useState } from "react";
import { Point, BrushSettings, Stroke } from "../../types";
import { calculateInkUsage } from "../../utils/ink";

interface CanvasProps {
  width: number;
  height: number;
  brushSettings: BrushSettings;
  inkUsed: number;
  inkLimit: number;
  strokes: Stroke[];
  onStrokeStart: () => void;
  onStrokeEnd: (path: Point[]) => void;
  onInkUsed: (amount: number) => void;
  isCurrentPlayerTurn: boolean;
}

const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  brushSettings,
  inkUsed,
  inkLimit,
  strokes,
  onStrokeStart,
  onStrokeEnd,
  onInkUsed,
  isCurrentPlayerTurn,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return;

    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = brushSettings.color;
    context.lineWidth = brushSettings.width;

    contextRef.current = context;

    // Redraw all strokes
    redrawCanvas();
  }, [width, height]);

  // Update brush settings when they change
  useEffect(() => {
    const context = contextRef.current;
    if (!context) return;

    context.strokeStyle = brushSettings.color;
    context.lineWidth = brushSettings.width;
  }, [brushSettings]);

  // Redraw canvas when strokes change
  useEffect(() => {
    redrawCanvas();
  }, [strokes]);

  // Redraw all strokes on canvas
  const redrawCanvas = () => {
    const context = contextRef.current;
    const canvas = canvasRef.current;
    if (!context || !canvas) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach((stroke) => {
      if (stroke.path.length < 2) return;

      context.beginPath();
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;

      context.moveTo(stroke.path[0].x, stroke.path[0].y);

      for (let i = 1; i < stroke.path.length; i++) {
        context.lineTo(stroke.path[i].x, stroke.path[i].y);
      }

      context.stroke();
    });

    // Reset to current brush settings
    context.strokeStyle = brushSettings.color;
    context.lineWidth = brushSettings.width;
  };

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isCurrentPlayerTurn) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    let clientX, clientY;

    if ("touches" in e) {
      e.preventDefault(); // Prevent scrolling on touch devices
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    context.beginPath();
    context.moveTo(x, y);

    setIsDrawing(true);
    setCurrentPath([{ x, y }]);
    onStrokeStart();
  };

  // Continue drawing
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !isCurrentPlayerTurn) return;

    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    let clientX, clientY;

    if ("touches" in e) {
      e.preventDefault(); // Prevent scrolling on touch devices
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Get the last point to calculate ink usage
    const lastPoint = currentPath[currentPath.length - 1];
    const newPoint = { x, y };

    // Calculate new ink usage for this segment
    const newInkUsage = calculateInkUsage(
      [lastPoint, newPoint],
      brushSettings.width
    );

    // Check if adding this point would exceed ink limit
    if (inkUsed + newInkUsage > inkLimit) {
      stopDrawing();
      return;
    }

    // Draw the line segment
    context.lineTo(x, y);
    context.stroke();

    // Update path and ink usage
    setCurrentPath([...currentPath, newPoint]);
    onInkUsed(newInkUsage);
  };

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing || !isCurrentPlayerTurn) return;

    const context = contextRef.current;
    if (!context) return;

    context.closePath();
    setIsDrawing(false);

    if (currentPath.length > 1) {
      onStrokeEnd(currentPath);
    }

    setCurrentPath([]);
  };

  return (
    <canvas
      ref={canvasRef}
      className="border-2 border-gray-300 rounded-lg shadow-lg touch-none bg-white"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        cursor: isCurrentPlayerTurn ? "crosshair" : "not-allowed",
      }}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
      onTouchStart={startDrawing}
      onTouchMove={draw}
      onTouchEnd={stopDrawing}
    />
  );
};

export default Canvas;
