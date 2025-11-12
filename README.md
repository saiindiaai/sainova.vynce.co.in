 HEAD
# Vynce Social Real-time Messaging System
  
This is a project built with [Chef](https://chef.convex.dev) using [Convex](https://convex.dev) as its backend.
 You can find docs about Chef with useful information like how to deploy to production [here](https://docs.convex.dev/chef).
  
This project is connected to the Convex deployment named [`hallowed-frog-811`](https://dashboard.convex.dev/d/hallowed-frog-811).
  
## Project structure
  
The frontend code is in the `app` directory and is built with [Vite](https://vitejs.dev/).
  
The backend code is in the `convex` directory.
  
`npm run dev` will start the frontend and backend servers.

## App authentication

Vynce Social uses [Convex Auth](https://auth.convex.dev/) with email and password sign-in flows enabled. Update the configuration before deploying if you need additional providers.

## Developing and deploying your app

Check out the [Convex docs](https://docs.convex.dev/) for more information on how to develop with Convex.
* If you're new to Convex, the [Overview](https://docs.convex.dev/understanding/) is a good place to start
* Check out the [Hosting and Deployment](https://docs.convex.dev/production/) docs for how to deploy your app
* Read the [Best Practices](https://docs.convex.dev/understanding/best-practices/) guide for tips on how to improve you app further

## HTTP API

User-defined http routes are defined in the `convex/router.ts` file. We split these routes into a separate file from `convex/http.ts` to allow us to prevent the LLM from modifying the authentication routes.


## LICENSE

© 2025 SaiNova Technologies. All Rights Reserved.
Unauthorized use or reproduction of this code is strictly prohibited.
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
 662b1d3ff5d0c316ff21f12ce3f9b1bdb864639a

