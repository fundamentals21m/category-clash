# Category Clash

A two-player online trivia and category battle game.

## Quick Start

```bash
# Install dependencies
npm install

# Build shared types (required first time)
npm run build:shared

# Run both server and client
npm run dev
```

Then open http://localhost:5173 in two browser tabs to test.

## Development

### Run individually

```bash
# Server only (port 3001)
npm run dev:server

# Client only (port 5173)
npm run dev:client
```

### Project Structure

```
category-clash/
├── client/          # React + Vite frontend
├── server/          # Node.js + Socket.io backend
├── shared/          # Shared TypeScript types
└── package.json     # Root with npm workspaces
```

## How to Play

1. **Create or Join**: One player creates a game and shares the 4-letter code
2. **Ready Up**: Both players click "Ready" and host starts the game
3. **Trivia Round**: Answer the multiple choice question (10 seconds)
4. **Category Battle**: Take turns naming items in the category (10 seconds each)
5. **Win**: First to reach +100 or -100 on the tug-of-war bar wins!

## Game Rules

- **Trivia**: +15 points for correct answer (only if opponent is wrong)
- **Category**: +5 points per valid item you name
- **Fails**: Two consecutive fails (invalid, pass, or timeout) ends the round
- **Win Threshold**: Reach ±100 or complete 10 rounds
