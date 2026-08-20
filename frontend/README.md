# Frontend — Employee Seating Management System

React + Vite + Tailwind admin dashboard. See the [root README](../README.md)
for full project documentation (architecture, API reference, deployment).

## Local development

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api/*` to a Flask backend on
`http://localhost:5001` (see `vite.config.js`). Start the backend first —
see `../backend/README` equivalent instructions in the root README.

## Build

```bash
npm run build
```

Outputs to `dist/`. In production this isn't served standalone — the root
`Dockerfile` copies `dist/` into the Flask backend, which serves it directly.
