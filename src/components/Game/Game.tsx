// src/components/Game.tsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import Canvas from "../Canvas/Canvas";
import BrushPicker from "../BrushPicker/BrushPicker";
import InkIndicator from "../InkIndicator/InkIndicator";
import ActionButtons from "../ActionButtons/ActionButtons";
import Toast from "../Toast/Toast";
import OrientationDetector from "../OrientationDetector/OrientationDetector";
import { useGameState } from "../../hooks/useGameState";
import { socketService } from "../../services/socket";
// import { calculateInkUsage } from '../../utils/ink';
import { BrushSettings, Point } from "../../types";

interface GameProps {
  gameId: string;
  isMultiplayer: boolean;
  isPlayer1?: boolean;
}

const Game: React.FC<GameProps> = ({
  gameId,
  isMultiplayer = false,
  isPlayer1 = true,
}) => {
  // Get screen dimensions
  const [dimensions, setDimensions] = useState({
    width: 800,
    height: 600,
  });

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info" as "info" | "success" | "warning" | "error",
    player: undefined as 1 | 2 | undefined,
  });

  // Local stroke tracking for current turn
  const [activeStroke, setActiveStroke] = useState<Point[]>([]);
  const [canRedo, setCanRedo] = useState(false);

  // Initialize game state
  const { state, dispatch, getAllStrokes } = useGameState(
    dimensions.width,
    dimensions.height,
    gameId
  );

  // Track if this client can act based on player turn
  const isCurrentPlayerTurn = useCallback(() => {
    if (!isMultiplayer) return true;
    return isPlayer1 ? state.currentPlayer === 1 : state.currentPlayer === 2;
  }, [isMultiplayer, isPlayer1, state.currentPlayer]);

  // Effect for screen dimensions
  useEffect(() => {
    const handleResize = () => {
      // In desktop or testing, we might want fixed dimensions
      // On mobile, we want to use the full screen
      const isMobile =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );

      if (isMobile) {
        setDimensions({
          width: window.innerWidth - 40, // Padding
          height: window.innerHeight - 200, // Space for UI
        });
      } else {
        // Use fixed size for desktop
        setDimensions({
          width: Math.min(window.innerWidth - 40, 800),
          height: Math.min(window.innerHeight - 200, 600),
        });
      }
    };

    // Set initial dimensions
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Initialize socket connection for multiplayer
  useEffect(() => {
    if (!isMultiplayer) return;

    const initializeSocket = async () => {
      try {
        await socketService.initialize(gameId, isPlayer1);

        // Listen for game state updates from other player
        socketService.onGameStateUpdated((gameState) => {
          dispatch({ type: "SET_GAME_STATE", payload: gameState });
        });

        // Listen for player join events
        socketService.onPlayerJoined(
          ({ playerId, isPlayer1: joinedAsPlayer1 }) => {
            // Show toast when other player joins
            setToast({
              show: true,
              message: `Player ${joinedAsPlayer1 ? "1" : "2"} joined the game!`,
              type: "success",
              player: joinedAsPlayer1 ? 1 : 2,
            });
          }
        );
      } catch (error) {
        console.error("Failed to connect socket:", error);
        setToast({
          show: true,
          message: "Connection error. Try refreshing.",
          type: "error",
          player: undefined,
        });
      }
    };

    initializeSocket();

    // Clean up socket on unmount
    return () => socketService.disconnect();
  }, [gameId, isMultiplayer, isPlayer1, dispatch]);

  // Sync game state with socket for multiplayer
  useEffect(() => {
    if (!isMultiplayer) return;

    // Send updated game state after local changes
    socketService.sendGameState(state);
  }, [state, isMultiplayer]);

  // Show toast when turn changes
  useEffect(() => {
    const currentTurn = state.turns[state.currentTurn - 1];
    if (!currentTurn) return;

    setToast({
      show: true,
      message: `Player ${state.currentPlayer}'s turn (Turn ${state.currentTurn})`,
      type: "info",
      player: state.currentPlayer,
    });

    // Clear toast after 3 seconds
    const timer = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [state.currentPlayer, state.currentTurn]);

  // Handle brush changes
  const handleBrushChange = useCallback(
    (brushSettings: BrushSettings) => {
      dispatch({ type: "SET_BRUSH", payload: brushSettings });
    },
    [dispatch]
  );

  // Handle stroke start
  const handleStrokeStart = useCallback(() => {
    setActiveStroke([]);
  }, []);

  // Handle stroke end
  const handleStrokeEnd = useCallback(
    (path: Point[]) => {
      if (path.length < 2) return;

      const currentTurn = state.turns[state.currentTurn - 1];
      if (!currentTurn) return;

      dispatch({
        type: "ADD_STROKE",
        payload: {
          path,
          color: currentTurn.brushSettings.color,
          width: currentTurn.brushSettings.width,
        },
      });

      // Update active stroke for undo functionality
      setActiveStroke(path);

      // Disable redo after adding a new stroke
      setCanRedo(false);
    },
    [state.turns, state.currentTurn, dispatch]
  );

  // Handle ink usage
  const handleInkUsed = useCallback(
    (amount: number) => {
      dispatch({ type: "UPDATE_INK", payload: { amount } });
    },
    [dispatch]
  );

  // Handle undo
  const handleUndo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, [dispatch]);

  // Handle redo (placeholder since we're not fully implementing redo)
  const handleRedo = useCallback(() => {
    // This would need to be implemented with proper redo stack if needed
    console.log("Redo not implemented");
  }, []);

  // Handle end turn
  const handleEndTurn = useCallback(() => {
    dispatch({ type: "END_TURN" });
  }, [dispatch]);

  // Get current turn info
  const currentTurn = state.turns[state.currentTurn - 1] || {
    player: 1,
    turnNumber: 1,
    strokes: [],
    inkUsed: 0,
    inkLimit: state.inkLimit,
    brushSettings: { color: "#cf3f3f", width: 5 },
  };

  // Check if can undo (has strokes in current turn)
  const canUndo = currentTurn.strokes.length > 0 && isCurrentPlayerTurn();

  return (
    <OrientationDetector>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
        <Toast
          message={toast.message}
          type={toast.type}
          show={toast.show}
          player={toast.player}
          onClose={() => setToast((prev) => ({ ...prev, show: false }))}
        />

        <header className="w-full max-w-3xl mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Paint-n-Pass</h1>
          <div className="text-gray-600">
            {isMultiplayer ? (
              <div>
                <span className="mr-2">Game ID: {gameId}</span>
                <span
                  className={`
                  px-2 py-1 rounded text-sm text-white
                  ${isPlayer1 ? "bg-player-1" : "bg-player-2"}
                `}
                >
                  Player {isPlayer1 ? "1" : "2"}
                </span>
              </div>
            ) : (
              <div className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{
                    backgroundColor:
                      state.currentPlayer === 1 ? "#cf3f3f" : "#6539a0",
                  }}
                />
                <span>Player {state.currentPlayer}'s Turn</span>
              </div>
            )}
          </div>
        </header>

        <main className="w-full max-w-3xl mb-4">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="mb-4">
              <Canvas
                width={dimensions.width}
                height={dimensions.height}
                brushSettings={currentTurn.brushSettings}
                inkUsed={currentTurn.inkUsed}
                inkLimit={currentTurn.inkLimit}
                strokes={getAllStrokes()}
                onStrokeStart={handleStrokeStart}
                onStrokeEnd={handleStrokeEnd}
                onInkUsed={handleInkUsed}
                isCurrentPlayerTurn={isCurrentPlayerTurn()}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4">
                <BrushPicker
                  brushSettings={currentTurn.brushSettings}
                  onBrushChange={handleBrushChange}
                />

                <div className="w-40 sm:w-56">
                  <InkIndicator
                    inkUsed={currentTurn.inkUsed}
                    inkLimit={currentTurn.inkLimit}
                    player={state.currentPlayer}
                  />
                </div>
              </div>

              <ActionButtons
                onUndo={handleUndo}
                onRedo={handleRedo}
                onEndTurn={handleEndTurn}
                canUndo={canUndo}
                canRedo={canRedo}
                currentPlayer={state.currentPlayer}
              />
            </div>
          </div>
        </main>

        <footer className="w-full max-w-3xl text-center text-sm text-gray-500">
          Paint-n-Pass - A collaborative drawing game
        </footer>
      </div>
    </OrientationDetector>
  );
};

export default Game;
