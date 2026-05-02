# ChatFlow

ChatFlow is a real-time temporary chat room demo built with React, TypeScript, Tailwind CSS, Node.js, Express, and Socket.IO.

Users can join a live room by entering:

- a username
- the room owner's name
- the room name

Messages are delivered in real time and are not saved to a database.

## Features

- Real-time chat with Socket.IO
- Custom room names
- Room owner + room name matching
- Online user list
- Responsive React UI
- Tailwind CSS styling
- No account required
- No chat history stored

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Vite
- Node.js
- Express
- Socket.IO

## Important Demo Note

This is a portfolio/demo project, not a secure private messenger.

Messages are live only and are not stored. Anyone who knows the exact room owner and room name can join that room while the server is running.

Room owner and room name are case-sensitive:

```text
Cynthia / Study
cynthia / Study
Cynthia / study
```

These are treated as different rooms.

## Requirements

Install Node.js before running the project.

Recommended:

```text
Node.js 20+
npm 10+
```

## Local Setup

Clone the repository:

```bash
git clone <repository-url>
cd <repository-folder>
```

Install dependencies:

```bash
npm install
```

Optional environment setup:

```bash
cp .env.example .env
```

The core chat demo does not require an API key. `PIXABAY_API_KEY` is only used for the optional `/gif` and `/emoji` commands.

## Run In Development

Start the backend server:

```bash
npm run dev:server
```

In a second terminal, start the React frontend:

```bash
npm run dev:client
```

Open the frontend in your browser:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:3001
```

## How To Test The Chat

Open two browser tabs at:

```text
http://localhost:5173
```

In both tabs, enter the same room owner and room name.

Example:

```text
Username: Alice
Room owner: Cynthia
Room name: study-room
```

Second tab:

```text
Username: Bob
Room owner: Cynthia
Room name: study-room
```

Now Alice and Bob should see each other in the online user list and can chat in real time.

## Testing From Another Device On The Same Network

Start both development servers:

```bash
npm run dev:server
npm run dev:client
```

Find your computer's local IP address.

Then another device on the same Wi-Fi can open:

```text
http://YOUR_LOCAL_IP:5173
```

Example:

```text
http://192.168.1.25:5173
```

Both users must enter the exact same room owner and room name.

If the second device cannot connect, check your firewall settings and make sure ports `5173` and `3001` are allowed on your computer.

## Build For Production

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

The Express server serves the built React app from:

```text
client/dist
```

## Suggested Deployment

This app can be deployed on a small VPS or cloud server that supports Node.js and WebSockets.

Examples:

- Alibaba Cloud Simple Application Server
- Render
- Railway
- Fly.io
- DigitalOcean

For a VPS deployment, a common setup is:

```text
Browser -> HTTPS domain -> Nginx -> Node.js app
```

The Node.js app can run on an internal port such as `3001`, while Nginx serves the public domain over `80` and `443`.

## Security Notes

This demo intentionally does not store chat messages.

Before using it as a public production app, add:

- rate limiting
- message length validation
- stricter CORS settings
- HTTPS
- environment variables for secrets
- moderation or abuse controls
- optional room passwords or invite codes

## Available Scripts

```bash
npm run dev:server
```

Runs the Express and Socket.IO backend with Nodemon.

```bash
npm run dev:client
```

Runs the Vite React development server.

```bash
npm run typecheck
```

Runs TypeScript checks.

```bash
npm run build
```

Builds the React app for production.

```bash
npm start
```

Starts the production Node.js server.
