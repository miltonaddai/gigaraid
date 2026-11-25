# GigaRaid

Village-building strategy game for the web. React + TypeScript + Vite + Tailwind + shadcn primitives, React Three Fiber world, username sign-in, Express battle server with in-memory persistence. Runs fully offline.

## Run it

```bash
yarn install
yarn dev
```

`yarn dev` starts the API on `:4000` and the web client on `:5173` together. `yarn build` then `yarn start` runs the production builds the same way.

Open `http://localhost:5173`. No accounts or API keys — pick a username and a village name and you're in. The username is stored in your browser and keys your village.

Copy `frontend/.env.example` → `frontend/.env` and `backend/.env.example` → `backend/.env` if you want to change ports. The API keeps villages in memory.

## Asset path (the important part)

I cannot mint Tripo-quality characters and buildings from here. Shipping a fake “hero pig GLB” would look worse than a clean procedural village and would fight the models you generate later.

**Best functional path — and what this repo is wired for:**

1. **Keep the isometric R3F scene and grid as the source of truth.** Camera, placement, production, and HUD do not care what the mesh looks like.
2. **Generate the real roster in [Tripo](https://www.tripo3d.ai)** (or Meshy) to match your Figma / concept stills: Town Hall, towers, mines, vats, builder hut, camps, minions, pig foreman.
3. Export **GLB**, triangulated, Y-up, real-world scale ~1–3 units, idle animation baked if you have one.
4. Drop files in `frontend/public/models/` and point `frontend/src/game/assets/manifest.ts` at them:

```ts
townhall: "/models/townhall.glb"
```

`ModelOrFallback` loads the GLB when the path is set and keeps the procedural mesh as a loading / missing fallback. Gameplay never stops.

Until those files land, the village is built from **toon-shaded procedural meshes** so you can play placement, production, settings, and tutorial today.

### What not to do

- Do not rebuild the world as a 2D sprite canvas. Your ideation already moved to Tripo 3D, and the isometric camera and combat are cheaper to keep in 3D.
- Do not stream giant unoptimized Tripo scenes. One GLB per building type, instanced / cloned, under ~2 MB each.

### Optional free kits while Tripo cooks

- [Kenney Fantasy Town](https://kenney.nl) (CC0)
- [Quaternius](https://quaternius.com) low-poly packs
- [Poly Pizza](https://poly.pizza) CC-BY models

Same drop-in: path in `manifest.ts`.

## Stack map

| Layer | Role |
| --- | --- |
| Frontend | HUD, isometric village, username sign-in |
| Express | In-memory village saves |

Gold packs are stubbed in the SHOP panel.

## Game loop

- Town Hall 1–10 gates unlocks.
- Gold mines produce on a tick. Storage can only lose a **fixed loot cut** (20%).
- Attacks and defenses are automatic: troops path to the nearest building, ranged units and towers hold radius.
- Matchmaking is Town Hall vs Town Hall.
- Beginner shield on first village. Raids re-apply a shorter shield.

## Screens

Landing (your video + still), village name, isometric base HUD, starter quests, build dock, army / clan / shop drawers, 5-step tutorial, settings.

## License

GigaRaid is open source under the [MIT License](LICENSE). Copyright (c) 2026 GigaRaid developers.
