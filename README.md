# Paint-n-Pass

A collaborative drawing game where players take turns adding details to create art together.

## Features

- **Collaborative Drawing**: Take turns with another player to create art
- **Brush Customization**: Choose color and width of your brush
- **Time Travel**: Undo and redo strokes within your turn
- **Turn Management**: Pass turns manually or automatically when ink runs out
- **Multi-device Support**: Play locally on one device or remotely on two devices

## Technologies Used

- **Frontend**: React, TypeScript, Next.js, Tailwind CSS
- **Backend**: Node.js, Socket.io
- **Database**: PostgreSQL with Prisma ORM

## Getting Started

### Prerequisites

- Node.js (v14+)
- PostgreSQL database

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/your-username/paint-n-pass.git
   cd paint-n-pass
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory based on the `.env.example` file

   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your PostgreSQL connection string

5. Initialize the database
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

### Running the Application

1. Start the development server

   ```bash
   npm run dev
   ```

2. Open your browser and navigate to `http://localhost:3000`

## Game Modes

### Single Device

Both players share the same device and pass it back and forth when their turn ends.

### Multiplayer

Players can join from separate devices:

1. First player creates a game and gets a unique Game ID
2. Second player enters the Game ID to join the same game
3. Players take turns drawing remotely

## How to Play

1. Select brush color and width using the brush picker
2. Draw on the canvas within your ink limit
3. End your turn using the "End Turn" button or wait until ink runs out
4. Pass the device to the other player (in single-device mode)
5. Continue taking turns to complete your masterpiece!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
