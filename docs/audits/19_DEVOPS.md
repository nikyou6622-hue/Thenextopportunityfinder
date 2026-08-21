# 19 — DEVOPS, CONTAINERIZATION & DEPLOYMENT AUDIT
**Deployment Architecture**: Standalone Multi-Stage Containerized Image or Bare-Metal Python/Node Process  
**Auditor**: Senior DevOps & Site Reliability Engineer (SRE)  
**Readiness**: **PRODUCTION-READY** (Multi-stage Dockerfile, docker-compose, and health probes verified).

---

## 1. Containerization Architecture (`Dockerfile`)

```dockerfile
# Stage 1: Fast Node 20 Frontend Asset Compiler
FROM node:20-alpine AS frontend-builder
WORKDIR /app/web
COPY web/package*.json ./
RUN npm ci
COPY web/ ./
RUN npm run build

# Stage 2: Minimalist Python 3.12 Production Runtime
FROM python:3.12-slim AS production-runtime
WORKDIR /app
ENV PYTHONUNBUFFERED=1 PYTHONDONTWRITEBYTECODE=1 PORT=8000 HOST=0.0.0.0

RUN apt-get update && apt-get install -y --no-install-recommends curl sqlite3 && rm -rf /var/lib/apt/lists/*
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

COPY backend/ ./backend/
COPY --from=frontend-builder /app/web/dist ./web/dist

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/healthz || exit 1

EXPOSE 8000
CMD ["python", "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2"]
```

---

## 2. Docker Compose Infrastructure (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: thenextopportunity-app
    restart: unless-stopped
    ports:
      - "8000:8000"
    environment:
      - PYTHONUNBUFFERED=1
      - DATABASE_URL=sqlite:///./nextoppr.db
      - ALLOWED_ORIGINS=http://localhost:8000,http://localhost:3001,http://127.0.0.1:8000
    volumes:
      - nextoppr_data:/app/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/healthz"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s

volumes:
  nextoppr_data:
    driver: local
```

---

## 3. Deployment Environments & Operating Modes

| Environment | Command / Workflow | Ports | Static Asset Delivery |
| :--- | :--- | :--- | :--- |
| **Local Development** | Terminal 1: `python -m uvicorn backend.app.main:app --port 8000 --reload`<br>Terminal 2: `npm run dev` in `web/` | `:8000` (API)<br>`:3001` (Vite SPA) | Vite Dev Server with HMR and `/api` proxy. |
| **Standalone Production Runner** | `python start_production.py --port 8000 --workers 2` | `:8000` | FastAPI serves compiled SPA directly from `web/dist`. |
| **Docker Container** | `docker compose up --build -d` | `:8000` | Self-contained single port `:8000` hosting both API and SPA. |
| **Cloud Deployment (AWS/GCP/Render/Fly.io)**| Direct Docker deploy with `PORT=8000` | `:8000` | Automated SSL termination, auto-scaling, and healthcheck monitoring. |

---

## 4. Disaster Recovery & Backup Strategy

1. **SQLite Database Backup**:
   * With WAL mode active, executing `sqlite3 nextoppr.db ".backup 'nextoppr_backup_$(date +%F).db'"` creates an online, lock-free, zero-downtime hot snapshot.
   * Recommend cron schedule to backup daily to an AWS S3 / Cloudflare R2 bucket.
2. **PostgreSQL Failover**:
   * In enterprise production, configure AWS RDS Multi-AZ or Supabase automated point-in-time recovery (PITR).
