import type { NextApiRequest, NextApiResponse } from "next";
import { GameState } from "../../../types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ResponseData = {
  success: boolean;
  data?: GameState;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ success: false, error: "Invalid game ID" });
  }

  try {
    // GET: Fetch game state
    if (req.method === "GET") {
      const game = await prisma.game.findUnique({
        where: { id },
      });

      if (!game) {
        return res
          .status(404)
          .json({ success: false, error: "Game not found" });
      }

      return res.status(200).json({
        success: true,
        data: JSON.parse(game.state) as GameState,
      });
    }

    // POST: Create or update game state
    else if (req.method === "POST") {
      const gameState = req.body as GameState;

      if (!gameState) {
        return res
          .status(400)
          .json({ success: false, error: "Missing game state data" });
      }

      // Upsert game (create or update)
      await prisma.game.upsert({
        where: { id },
        update: {
          state: JSON.stringify(gameState),
          updatedAt: new Date(),
        },
        create: {
          id,
          state: JSON.stringify(gameState),
        },
      });

      return res.status(200).json({ success: true });
    }

    // Method not allowed
    else {
      return res
        .status(405)
        .json({ success: false, error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
}
