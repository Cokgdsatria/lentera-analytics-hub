# Lentera Backend

FastAPI service for complaint submission, admin operations, analytics, and ML inference.

## Features

- JWT admin authentication
- Public complaint submission
- Admin complaint list, detail, status update, and CSV export
- Analytics summary and distributions
- ML inference contract with rule-based fallback
- SQLite for local/Docker use
- PostgreSQL-ready for Railway deployment

## Environment

Copy the example file:

```bash
cp .env.example .env
```

Important variables:

```env
LENTERA_DATABASE_URL=sqlite:///./lentera.db
LENTERA_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
LENTERA_JWT_SECRET_KEY=change-this-secret-before-deploy
LENTERA_ADMIN_EMAIL=admin@resolv.com
LENTERA_ADMIN_PASSWORD=admin123
LENTERA_UPLOAD_DIR=./storage/evidence
LENTERA_SKLEARN_PIPELINE_PATH=
LENTERA_KERAS_MODEL_PATH=
LENTERA_KERAS_TOKENIZER_PATH=
LENTERA_KERAS_LABEL_ENCODER_PATH=
LENTERA_KERAS_MAX_LEN=200
LENTERA_KERAS_LABELS=High,Low,Medium
```

Use a strong `LENTERA_JWT_SECRET_KEY` and admin password outside local development.

## Run Locally

```bash
cd lentera-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Local URLs:

```text
API:    http://localhost:8000
Docs:   http://localhost:8000/docs
Health: http://localhost:8000/health
```

Default admin credentials:

```text
admin@resolv.com / admin123
```

## Docker

Build and run only the backend:

```bash
docker build -t lentera-backend:local .
docker run --rm -p 8000:8000 \
  -e LENTERA_DATABASE_URL=sqlite:////app/data/lentera.db \
  -e LENTERA_UPLOAD_DIR=/app/data/evidence \
  -e LENTERA_CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173 \
  -e LENTERA_JWT_SECRET_KEY=dev-docker-secret-change-before-deploy \
  -v lentera_backend_data:/app/data \
  lentera-backend:local
```

To run backend + frontend together, use this from the repo root:

```bash
docker compose up --build -d
```

## Deploy to Railway

Recommended Railway setup:

```text
Service: lentera-backend
Root Directory: lentera-backend
Builder: Dockerfile
Port: 8000
Database: Railway PostgreSQL
```

Set Railway environment variables:

```env
LENTERA_DATABASE_URL=postgresql+psycopg://USER:PASSWORD@HOST:PORT/DATABASE
LENTERA_CORS_ORIGINS=https://URL-FRONTEND-VERCEL
LENTERA_JWT_SECRET_KEY=generate-a-strong-random-secret
LENTERA_ADMIN_EMAIL=email-admin
LENTERA_ADMIN_PASSWORD=password-admin-kuat
LENTERA_UPLOAD_DIR=/app/storage/evidence
LENTERA_SKLEARN_PIPELINE_PATH=
LENTERA_KERAS_MODEL_PATH=
LENTERA_KERAS_TOKENIZER_PATH=
LENTERA_KERAS_LABEL_ENCODER_PATH=
LENTERA_KERAS_MAX_LEN=200
LENTERA_KERAS_LABELS=High,Low,Medium
```

Notes:

- Railway's PostgreSQL connection URL may start with `postgresql://`; for SQLAlchemy + psycopg, use `postgresql+psycopg://`.
- If you deploy frontend separately on Vercel, add that Vercel URL to `LENTERA_CORS_ORIGINS`.
- Runtime database files and uploads are not committed to GitHub.

## ML Inference

The backend exposes a stable inference contract even before the final model artifact exists.

- If `LENTERA_KERAS_MODEL_PATH` and `LENTERA_KERAS_TOKENIZER_PATH` point to valid Keras model and tokenizer artifacts, the backend uses the Keras model for urgency prediction.
- If `LENTERA_SKLEARN_PIPELINE_PATH` points to a valid joblib pipeline, the backend will try to use it.
- Otherwise, it uses a deterministic rule-based provider and marks predictions with `provider=rules`.

The Keras provider expects a pickled `tensorflow.keras.preprocessing.text.Tokenizer`.
Use `LENTERA_KERAS_MAX_LEN=200` for the CNN-BiLSTM run. Set `LENTERA_KERAS_LABEL_ENCODER_PATH` when the pickled label encoder is available; otherwise keep `LENTERA_KERAS_LABELS=High,Low,Medium` as the fallback label order.

The two shared DagsHub runs require a signed-in contributor session to download artifacts. From the local notebook outputs:

- `m_31e7e74c08914ab395e0151b02f14510` is `cnnbilstm_Run`, with test accuracy `0.84` and macro F1 `0.84`.
- `m_87bf7b979f794148b3cdc5af3b148eb3` appears to be the BiLSTM-FastText run; the completed Phase 1 output shows test accuracy `0.8322` and macro F1 `0.81`, while the Phase 2 final test output is incomplete in the committed notebook.

Use the CNN-BiLSTM run unless the DagsHub metrics for `m_87bf7...` show a better final test macro F1 after login.

Expected production path:

```text
React frontend -> FastAPI backend -> inference provider -> database -> analytics/admin UI
```

## API Overview

```text
GET   /health
POST  /api/v1/auth/login
POST  /api/v1/complaints
GET   /api/v1/complaints
GET   /api/v1/complaints/{public_id}
PATCH /api/v1/complaints/{public_id}
GET   /api/v1/complaints/export.csv
GET   /api/v1/analytics/summary
POST  /api/v1/inference/predict
```

## Testing

From the repo root, with the backend running:

```bash
python3 tests/test_all_features.py
```

The tests are HTTP integration tests and use only Python's standard library.

## Public Repo Safety

Do not commit `.env`, runtime database files, uploads, model artifacts, or private keys. Use `.env.example` as the public template.
