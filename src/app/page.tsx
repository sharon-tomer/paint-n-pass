"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  const [gameId, setGameId] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState("");

  // Generate a random game ID
  const generateGameId = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Handle creating a new game
  const handleCreateGame = () => {
    const newGameId = generateGameId();
    router.push(`/game/${newGameId}?mode=host`);
  };

  // Handle joining an existing game
  const handleJoinGame = (e: React.FormEvent) => {
    e.preventDefault();

    if (!gameId.trim()) {
      setError("Please enter a game ID");
      return;
    }

    // Validate game ID format (alphanumeric, 6 chars)
    if (!/^[A-Z0-9]{6}$/.test(gameId)) {
      setError("Invalid game ID format. Should be 6 alphanumeric characters.");
      return;
    }

    router.push(`/game/${gameId}?mode=join`);
  };

  // Handle starting a single device game
  const handleSingleDeviceGame = () => {
    router.push(`/game/local`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100 p-4">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
        <h1 className="text-4xl font-bold text-indigo-900 mb-2">
          Paint-n-Pass
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Take turns to create art together
        </p>

        <div className="bg-white shadow-xl rounded-xl p-6 w-full max-w-md">
          <div className="space-y-6">
            <button
              onClick={handleSingleDeviceGame}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition"
            >
              Play on Single Device
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  or play remotely
                </span>
              </div>
            </div>

            <button
              onClick={handleCreateGame}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg shadow-md hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-opacity-50 transition"
            >
              Create New Game
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or</span>
              </div>
            </div>

            <div>
              <button
                onClick={() => setIsJoining(!isJoining)}
                className="w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg shadow-sm hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition"
              >
                Join Existing Game
              </button>

              {isJoining && (
                <form onSubmit={handleJoinGame} className="mt-3">
                  <div className="mb-3">
                    <input
                      type="text"
                      value={gameId}
                      onChange={(e) => {
                        setGameId(e.target.value.toUpperCase());
                        setError("");
                      }}
                      placeholder="Enter Game ID"
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      maxLength={6}
                    />
                    {error && (
                      <p className="text-red-500 text-xs mt-1">{error}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 px-4 bg-indigo-500 text-white rounded hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 transition"
                  >
                    Join Game
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full max-w-3xl py-8 text-center text-sm text-gray-500">
        Use your creativity and collaborate with friends to create beautiful art
        together.
      </footer>
    </div>
  );
}
