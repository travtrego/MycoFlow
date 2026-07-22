# MycoFlow

Mushroom cultivation tracker — cultures, batches, locations, and harvest inventory.

Built with Next.js 15 (App Router) and TypeScript. Data lives in the browser's
`localStorage`; see `DATA_MODEL.md` for the entity model and phase state machine
this app implements.

## Develop

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run typecheck` — type-check without emitting
