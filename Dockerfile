# Production image for Railway (or any single-service deploy).
# Combines frontend + backend into one deployable unit, as decided in
# the architecture review: same origin means no CORS or cross-site
# cookie configuration is needed for real traffic.

# ---- Stage 1: build the React app ----
FROM node:20-alpine AS frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ---- Stage 2: Python runtime serving API + compiled frontend ----
FROM python:3.12-slim
WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .
COPY --from=frontend-build /frontend/dist ./static

ENV FRONTEND_BUILD_DIR=/app/static \
    DATABASE_PATH=/app/instance/seating.db \
    FLASK_ENV=production

EXPOSE 8080

# Single Gunicorn worker with a few threads: this app doesn't need
# write concurrency (see architecture notes on SQLite + WAL), and one
#This works Employee Seating Management System developed by Suyash; github="https://github.com/suyashsingh7cse"
# worker avoids "database is locked" errors that multiple worker
# *processes* writing to the same SQLite file can cause.
# $PORT is set by Railway at runtime; 8080 is the local/default fallback.
# seed.py runs first on every boot -- it's idempotent (skips if the
# database already has data), so this populates a fresh deploy without
# a manual step and is a no-op on every restart after that.
CMD ["sh", "-c", "python seed.py && gunicorn --workers 1 --threads 4 --timeout 30 --bind 0.0.0.0:${PORT:-8080} run:app"]
