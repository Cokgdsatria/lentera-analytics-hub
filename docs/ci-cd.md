# Deployment

This repository uses the simplest deploy path that is currently verifiable from the CLI:

- Frontend changes under `lentera-frontend/**` deploy through GitHub Actions with the Vercel CLI.
- Backend changes under `lentera-backend/**` deploy through Railway's native GitHub source trigger.

The frontend workflow also supports manual runs from the GitHub Actions tab.

## Frontend: Vercel

GitHub Actions runs Vercel CLI from `lentera-frontend`.

Required GitHub Actions secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

The project is linked locally at `lentera-frontend/.vercel/project.json`, but that file is intentionally ignored. The workflow uses GitHub secrets instead.

## Backend: Railway

Railway is connected directly to this GitHub repository:

```text
Repo: Cokgdsatria/lentera-analytics-hub
Branch: main
Root Directory: /lentera-backend
Dockerfile Path: /lentera-backend/Dockerfile
Watch Patterns: lentera-backend/**
```

Keep backend runtime variables in Railway, not in GitHub Actions.
