# Lentera Integration Tests

These tests exercise the running backend through HTTP. They are intentionally
stdlib-only so they can run without adding host test dependencies.

Start the app first:

```bash
docker compose up --build -d
```

Run:

```bash
python3 tests/test_all_features.py
```

Optional environment variables:

```bash
LENTERA_TEST_BASE_URL=http://localhost:8000
LENTERA_TEST_ADMIN_EMAIL=admin@resolv.com
LENTERA_TEST_ADMIN_PASSWORD=admin123
```

The script creates sample complaints that cover:

- Security / Privacy -> High urgency
- System Glitch -> Medium urgency
- Customer Service -> Low urgency
- Infrastructure Issue -> Low urgency
- Billing Dispute prediction from `Other` -> Medium urgency

