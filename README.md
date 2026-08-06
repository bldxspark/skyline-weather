# Skyline Weather

A lightweight weather dashboard built with React and Vite.

Skyline Weather fetches live location and forecast data from the Open-Meteo APIs and displays an interactive hourly and 7-day weather overview.

## Features

- Search weather by city name
- Live updates for current conditions
- Hourly forecast for the next 8 hours
- 7-day forecast summary
- Simple responsive layout with clean UI

## Tech Stack

- React 19
- Vite 4
- TypeScript
- CSS for styling

## Prerequisites

- Node.js `>=22.13.0`

## Getting Started

```bash
npm install
npm run dev
```

Then open the URL shown by Vite, typically `http://localhost:5173`.

You can also view the live deployment at: https://weather-spark.vercel.app/

## Available Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally

## Demo

Visit the live app at: https://weather-spark.vercel.app/

Try searching for cities like `New York`, `London`, or `Tokyo` to see current conditions, hourly updates, and a 7-day forecast.

## Project Structure

- `src/App.tsx` — main weather app UI and logic
- `src/main.tsx` — Vite React entrypoint
- `app/globals.css` — app styles
- `index.html` — Vite app shell
- `vite.config.ts` — Vite configuration

## Notes

- This app uses the Open-Meteo public APIs for geocoding and forecast data.
- No API keys or additional environment setup are required for local development.
- The project was simplified from a Vinext/Cloudflare starter to a plain Vite React app.
