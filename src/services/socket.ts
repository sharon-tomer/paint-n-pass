// src/services/socket.ts

import { io, Socket } from "socket.io-client";
import { GameState } from "../types";

class SocketService {
  private socket: Socket | null = null;
  private gameId: string = "";
  private isPlayer1: boolean = false;

  // Initialize the socket connection
  initialize(gameId: string, isPlayer1: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      this.gameId = gameId;
      this.isPlayer1 = isPlayer1;

      // Connect to socket server
      this.socket = io(
        process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001",
        {
          autoConnect: true,
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        }
      );

      // Handle connection
      this.socket.on("connect", () => {
        console.log("Socket connected");
        this.joinGame();
        resolve();
      });

      // Handle errors
      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        reject(error);
      });

      // Handle disconnection
      this.socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });
    });
  }

  // Join a game room
  private joinGame(): void {
    if (!this.socket || !this.gameId) return;

    this.socket.emit("join_game", {
      gameId: this.gameId,
      isPlayer1: this.isPlayer1,
    });
  }

  // Send updated game state
  sendGameState(gameState: GameState): void {
    if (!this.socket || !this.gameId) return;

    this.socket.emit("update_game", {
      gameId: this.gameId,
      gameState,
    });
  }

  // Listen for game state updates
  onGameStateUpdated(callback: (gameState: GameState) => void): void {
    if (!this.socket) return;

    this.socket.on("game_updated", ({ gameState }) => {
      callback(gameState);
    });
  }

  // Get notified when a player joins
  onPlayerJoined(
    callback: (data: { playerId: string; isPlayer1: boolean }) => void
  ): void {
    if (!this.socket) return;

    this.socket.on("player_joined", (data) => {
      callback(data);
    });
  }

  // Clean up socket connection
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Export as a singleton
export const socketService = new SocketService();
