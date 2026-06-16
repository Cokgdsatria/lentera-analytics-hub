# Lentera Backend

FastAPI service for complaint submission, admin operations, analytics, and ML inference.

## Run Locally

```bash
cd lentera-backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Default admin credentials:

```text
admin@resolv.com / admin123
```

Set a strong `LENTERA_JWT_SECRET_KEY` and admin password before deploying.

## ML Inference

The backend exposes a stable inference contract even before the final model artifact exists.

- If `LENTERA_SKLEARN_PIPELINE_PATH` points to a valid joblib pipeline, the backend will try to use it.
- Otherwise, it uses a deterministic rule-based provider and marks predictions with `provider=rules`.

Expected production path:

```text
React frontend -> FastAPI backend -> inference provider -> database -> analytics/admin UI
```
