// src/utils/ink.ts

import { Point } from "../types";

/**
 * Calculate distance between two points
 */
export const calculateDistance = (point1: Point, point2: Point): number => {
  const dx = point2.x - point1.x;
  const dy = point2.y - point1.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate total stroke distance
 */
export const calculateStrokeDistance = (path: Point[]): number => {
  if (path.length < 2) return 0;

  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    totalDistance += calculateDistance(path[i - 1], path[i]);
  }

  return totalDistance;
};

/**
 * Calculate ink usage based on path and width
 */
export const calculateInkUsage = (path: Point[], width: number): number => {
  return calculateStrokeDistance(path) * width;
};

/**
 * Calculate ink limit (10% of canvas area)
 */
export const calculateInkLimit = (
  canvasWidth: number,
  canvasHeight: number
): number => {
  return canvasWidth * canvasHeight * 0.1;
};
