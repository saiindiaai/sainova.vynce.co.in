# Vynce Backend (Ready for Render)

This is a ready-to-deploy Node.js + Express backend for Vynce platform integration.
It includes session creation, app availability list, and analytics logging.

## Setup (local)

1. Copy `.env.example` to `.env` and set your MongoDB Atlas URI:
   ```
   cp .env.example .env
   # edit .env and paste MONGO_URI
   ```
2. Install deps:
   ```bash
   npm install
   ```
3. Start server:
   ```bash
   npm start
   ```

## Deploy to Render
1. Push this repo to GitHub.
2. Create a new Web Service on Render and connect your GitHub repo.
3. Set the environment variable `MONGO_URI` in Render's dashboard.
4. Deploy — Render will run `npm start`.

## Endpoints
- POST /api/auth/session  -> create session { userId, acceptedTerms }
- GET  /api/apps/available -> list of apps
- POST /api/analytics -> log event { event, userId, appId }

