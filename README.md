# Digital Learning Companion

Offline-first learning platform: React + Vite frontend and Express + MySQL backend.

## Local development

```bash
# Backend
cd server
cp .env.example .env
npm install
npm run dev

# Frontend (separate terminal)
cd client
cp .env.example .env
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:5000`. Leave `VITE_API_BASE_URL` empty locally.

## GitHub + Render CI/CD

This repo deploys as two Render services from GitHub:

| Service | Type | Source |
| --- | --- | --- |
| `dlc-api` | Node web service | `server/` |
| `dlc-web` | Static site | `client/` |

**CI** (`.github/workflows/ci.yml`) runs on every push and pull request:

1. Build the frontend
2. Syntax-check the backend
3. Validate `render.yaml`

**CD** is Render auto-deploy with `autoDeployTrigger: checksPass`. After GitHub Actions passes on `main`, Render rebuilds and publishes both services.

### First-time Render setup

1. Push this repo to GitHub (already linked at `dhanu-techie/Digital_Learning_Companion`).
2. Open [Render Blueprints](https://dashboard.render.com/blueprints) and connect the GitHub repo, or use:

   `https://dashboard.render.com/select-repo?type=blueprint`

3. Select this repository. Render reads `render.yaml`.
4. When prompted, enter a hosted MySQL connection (Render does not provide managed MySQL):

   | Key | Example |
   | --- | --- |
   | `DB_HOST` | your-mysql-host |
   | `DB_PORT` | `3306` |
   | `DB_USER` | mysql user |
   | `DB_PASSWORD` | mysql password |
   | `DB_NAME` | `digital_learning_db` |
   | `DB_SSL` | `true` for most cloud MySQL hosts |

5. Apply the Blueprint. JWT secrets are generated automatically. The frontend build receives `VITE_API_BASE_URL` from the API service URL.

6. After the first deploy, optionally seed demo data:

   ```bash
   cd server
   npm run seed
   ```

   Point `.env` at the same MySQL instance used on Render, or run the seed command from a machine that can reach that database.

Free Render web services spin down after idle time. The first request after idle can take about a minute.

### Later deploys

Push or merge to `main`. GitHub Actions must pass, then Render deploys both services. No extra deploy workflow is required.
