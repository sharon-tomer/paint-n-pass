// server/socket.ts

import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { GameState } from "../src/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Setup Socket.io server
export const setupSocketServer = (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Game rooms Map to track active games
  const gameRooms = new Map<string, Set<string>>();

  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // Handle joining a game
    socket.on("join_game", async ({ gameId, isPlayer1 }) => {
      if (!gameId) return;

      // Join the game room
      socket.join(gameId);

      // Track players in the game
      if (!gameRooms.has(gameId)) {
        gameRooms.set(gameId, new Set());
      }

      const room = gameRooms.get(gameId);
      if (room) {
        room.add(socket.id);
      }

      // Notify other clients that a player joined
      socket.to(gameId).emit("player_joined", {
        playerId: socket.id,
        isPlayer1,
      });

      console.log(
        `Player ${socket.id} joined game ${gameId} as Player ${
          isPlayer1 ? "1" : "2"
        }`
      );

      // Fetch game state from DB if it exists
      try {
        const game = await prisma.game.findUnique({
          where: { id: gameId },
        });

        if (game) {
          // Send the current game state to the new player
          socket.emit("game_updated", {
            gameState: JSON.parse(game.state) as GameState,
          });
        }
      } catch (error) {
        console.error("Error fetching game state:", error);
      }
    });

    // Handle game state updates
    socket.on("update_game", async ({ gameId, gameState }) => {
      if (!gameId || !gameState) return;

      // Broadcast to all other clients in the room
      socket.to(gameId).emit("game_updated", { gameState });

      // Persist game state to database
      try {
        await prisma.game.upsert({
          where: { id: gameId },
          update: {
            state: JSON.stringify(gameState),
            updatedAt: new Date(),
          },
          create: {
            id: gameId,
            state: JSON.stringify(gameState),
          },
        });
      } catch (error) {
        console.error("Error saving game state:", error);
      }
    });

    // Handle client disconnect
    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);

      // Remove from all game rooms
      gameRooms.forEach((players, gameId) => {
        if (players.has(socket.id)) {
          players.delete(socket.id);

          // If room is empty, clean up
          if (players.size === 0) {
            gameRooms.delete(gameId);
          }
        }
      });
    });
  });

  return io;
};
