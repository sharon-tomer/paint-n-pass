"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Game from "../../../components/Game/Game";

interface GamePageProps {
  params: {
    id: string;
  };
}

export default function GamePage({ params }: GamePageProps) {
  const { id } = params;
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [isPlayer1, setIsPlayer1] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Local game mode
    if (id === "local") {
      setIsMultiplayer(false);
    } else {
      // Remote multiplayer game
      setIsMultiplayer(true);

      // Check if joining or hosting
      setIsPlayer1(mode === "host");
    }

    setIsLoading(false);
  }, [id, mode]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <Game gameId={id} isMultiplayer={isMultiplayer} isPlayer1={isPlayer1} />
  );
}
