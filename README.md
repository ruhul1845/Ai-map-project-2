# AI Map Project 2

A Vite + React + Tailwind CSS web app for an AI assignment. It uses OpenStreetMap through Leaflet and demonstrates:

- A* search with a straight-line distance heuristic for route planning.
- CSP/COP-style fuel/resource allocation.
- Three CSP heuristics from the provided slide: MRV / Most Constrained Variable, Degree Heuristic, and LCV / Least Constraining Value.
- AC-3 style preprocessing and forward checking style domain pruning.
- Result metrics for satisfied users, total distance, estimated time, and search nodes expanded.

## Run locally

```bash
cd ai-map-project-2
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Create command format requested

```bash
npm create vite@latest ai-map-project-2 -- --template react
cd ai-map-project-2
npm install
npm install tailwindcss postcss autoprefixer leaflet react-leaflet lucide-react
npx tailwindcss init -p
npm run dev
```

This submitted project already contains the final working source files.


## Tailwind CSS note
This project uses Tailwind CSS through `@tailwindcss/vite`, not PostCSS.
There is no `postcss.config.js` file.
