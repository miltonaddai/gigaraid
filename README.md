# GigaRaid

Village-building strategy game for the web. React + TypeScript + Vite + Tailwind + shadcn primitives, React Three Fiber world, username sign-in, Express API with in-memory persistence. Runs fully offline.

## Run it

```bash
yarn install
yarn dev
```

`yarn dev` starts the API on `:4000` and the web client on `:5173` together. `yarn build` then `yarn start` runs the production builds the same way.

Open `http://localhost:5173`. No accounts or API keys — pick a username and a village name and you're in. The username is stored in your browser and keys your village.

Copy `frontend/.env.example` → `frontend/.env` and `backend/.env.example` → `backend/.env` if you want to change ports. The API keeps villages in memory.

## 3D assets

The village currently renders **toon-shaded procedural meshes** and sprite sheets, so placement, production, settings and the tutorial are all playable without any 3D models.

To swap in real models:

1. **Keep the isometric R3F scene and grid as the source of truth.** Camera, placement, production, and HUD do not care what the mesh looks like.
2. Create or source models for the roster: Town Hall, towers, mines, vats, builder hut, camps and troops.
3. Export **GLB**, triangulated, Y-up, real-world scale ~1–3 units, idle animation baked if you have one.
4. Drop files in `frontend/public/models/` and point `frontend/src/game/assets/manifest.ts` at them:

```ts
townhall: "/models/townhall.glb"
```

`ModelOrFallback` loads the GLB when the path is set and keeps the procedural mesh as a loading / missing fallback. Gameplay never stops.

Keep each model lean: one GLB per building type, instanced or cloned, under ~2 MB each.

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
