# AgentRouter Chat

A Claude-style chat app that connects to AgentRouter-compatible models.

## Features
- dark mode and light mode styling
- Claude-inspired layout and UX
- model selector from AgentRouter or fallback demo models
- new chat / history / session management
- prompt input with message sending
- retry and copy actions
- AgentRouter API integration with graceful fallback

## Tech stack
- Next.js 14
- TypeScript
- Tailwind CSS
- React

## Local development

1. Install dependencies:
   npm install

2. Start the app:
   npm run dev

3. Open:
   http://localhost:3000

## Environment variables
Create a `.env.local` file and set:

AGENTROUTER_BASE_URL=https://your-agentrouter-url
AGENTROUTER_API_KEY=your_api_key_here

If these are not set, the app will run in demo mode with a safe fallback response.

## Production deployment
This project is ready to deploy to Vercel.

1. Push the repo to GitHub
2. Import the repo into Vercel
3. Add the environment variables above
4. Deploy

## Notes
This app is designed to match the feel of the screenshots while remaining reusable and easy to extend. It can be connected to the real AgentRouter model layer once your API details are added.
