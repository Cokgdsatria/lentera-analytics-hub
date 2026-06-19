#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import sys
import time
import unittest
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import dataclass
from uuid import uuid4


BASE_URL = os.getenv("LENTERA_TEST_BASE_URL", "http://localhost:8000").rstrip("/")
ADMIN_EMAIL = os.getenv("LENTERA_TEST_ADMIN_EMAIL", "admin@resolv.com")
ADMIN_PASSWORD = os.getenv("LENTERA_TEST_ADMIN_PASSWORD", "admin123")


@dataclass(frozen=True)
class ComplaintScenario:
    name: str
    company_name: str
    submitted_category: str
    description: str
    expected_urgency: str
    expected_sentiment: str
    expected_predicted_category: str


SCENARIOS = [
    ComplaintScenario(
        name="security_high",
        company_name="PT. Lentera Indonesia",
        submitted_category="Security / Privacy",
        description=(
            "There is a confirmed data breach with unauthorized account access "
            "and a possible privacy leak."
        ),
        expected_urgency="High",
        expected_sentiment="Negative",
        expected_predicted_category="Security / Privacy",
    ),
    ComplaintScenario(
        name="system_medium",
        company_name="PT. Lentera Indonesia",
        submitted_category="System Glitch",
        description=(
            "The customer dashboard has high latency and failed login attempts "
            "during normal work hours."
        ),
        expected_urgency="Medium",
        expected_sentiment="Negative",
        expected_predicted_category="System Glitch",
    ),
    ComplaintScenario(
        name="customer_service_low",
        company_name="ResolvCorp",
        submitted_category="Customer Service",
        description=(
            "I need clearer support response information from the service agent "
            "about my request."
        ),
        expected_urgency="Low",
        expected_sentiment="Neutral",
        expected_predicted_category="Customer Service",
    ),
    ComplaintScenario(
        name="infrastructure_low",
        company_name="PT. Pijak Lentera",
        submitted_category="Infrastructure Issue",
        description=(
            "The network facility infrastructure maintenance schedule needs "
            "better explanation for users."
        ),
        expected_urgency="Low",
        expected_sentiment="Neutral",
        expected_predicted_category="Infrastructure Issue",
    ),
    ComplaintScenario(
        name="billing_medium_from_other",
        company_name="ResolvCorp",
        submitted_category="Other",
        description=(
            "I was overcharged on the invoice and need a refund for the wrong "
            "payment amount."
        ),
        expected_urgency="Medium",
        expected_sentiment="Neutral",
        expected_predicted_category="Billing Dispute",
    ),
]


def request_json(path: str, method: str = "GET", token: str | None = None, payload: dict | None = None) -> dict:
    body = None
    headers = {"Accept": "application/json"}
    if payload is not None:
        body = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = f"Bearer {token}"

    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=body,
        method=method,
        headers=headers,
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def request_text(path: str, token: str | None = None) -> str:
    headers = {}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = urllib.request.Request(f"{BASE_URL}{path}", method="GET", headers=headers)
    with urllib.request.urlopen(request, timeout=10) as response:
        return response.read().decode("utf-8")


def post_form(path: str, fields: dict[str, str]) -> dict:
    encoded = urllib.parse.urlencode(fields).encode("utf-8")
    request = urllib.request.Request(
        f"{BASE_URL}{path}",
        data=encoded,
        method="POST",
        headers={
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
    )
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def wait_for_backend() -> None:
    last_error: Exception | None = None
    for _ in range(30):
        try:
            payload = request_json("/health")
            if payload.get("status") == "ok":
                return
        except Exception as exc:
            last_error = exc
        time.sleep(1)
    raise RuntimeError(f"Backend is not reachable at {BASE_URL}: {last_error}")


class LenteraFeatureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        wait_for_backend()
        login = request_json(
            "/api/v1/auth/login",
            method="POST",
            payload={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        )
        cls.token = login["access_token"]
        cls.created_ids: list[str] = []

    def test_01_rejects_invalid_login(self) -> None:
        with self.assertRaises(urllib.error.HTTPError) as context:
            request_json(
                "/api/v1/auth/login",
                method="POST",
                payload={"email": ADMIN_EMAIL, "password": "wrong-password"},
            )
        self.assertEqual(context.exception.code, 401)

    def test_02_public_submission_and_ml_inference_cover_categories_and_urgencies(self) -> None:
        observed_urgencies = set()
        observed_categories = set()

        for scenario in SCENARIOS:
            unique_email = f"{scenario.name}.{uuid4().hex[:8]}@example.test"
            created = post_form(
                "/api/v1/complaints",
                {
                    "is_anonymous": "false",
                    "first_name": "Feature",
                    "last_name": scenario.name,
                    "email": unique_email,
                    "company_name": scenario.company_name,
                    "category": scenario.submitted_category,
                    "description": scenario.description,
                },
            )
            self.created_ids.append(created["public_id"])
            observed_urgencies.add(created["urgency"])
            observed_categories.add(created["predicted_category"])

            self.assertIn(created["urgency"], {"High", "Medium", "Low"}, scenario.name)
            if created["inference_provider"] != "keras":
                self.assertEqual(created["urgency"], scenario.expected_urgency, scenario.name)
            self.assertEqual(created["sentiment"], scenario.expected_sentiment, scenario.name)
            self.assertEqual(created["predicted_category"], scenario.expected_predicted_category, scenario.name)
            self.assertGreaterEqual(created["confidence"], 0.5)
            self.assertIn(created["inference_provider"], {"rules", "sklearn", "keras"})

        self.assertTrue({"High", "Medium", "Low"}.issubset(observed_urgencies))
        self.assertTrue(
            {
                "Security / Privacy",
                "System Glitch",
                "Customer Service",
                "Infrastructure Issue",
                "Billing Dispute",
            }.issubset(observed_categories)
        )

    def test_03_admin_list_detail_status_update_analytics_and_export(self) -> None:
        listing = request_json("/api/v1/complaints?limit=100", token=self.token)
        self.assertGreaterEqual(listing["total"], len(SCENARIOS))

        first_id = listing["items"][0]["id"]
        detail = request_json(f"/api/v1/complaints/{first_id}", token=self.token)
        self.assertEqual(detail["public_id"], first_id)

        updated = request_json(
            f"/api/v1/complaints/{first_id}",
            method="PATCH",
            token=self.token,
            payload={"status": "In Progress", "resolution_notes": "Integration test triage note."},
        )
        self.assertEqual(updated["status"], "In Progress")
        self.assertEqual(updated["resolution_notes"], "Integration test triage note.")

        analytics = request_json("/api/v1/analytics/summary", token=self.token)
        self.assertGreaterEqual(analytics["total_complaints"], len(SCENARIOS))
        self.assertTrue(analytics["urgency_distribution"])
        self.assertTrue(analytics["category_distribution"])
        self.assertTrue(analytics["sentiment_distribution"])
        self.assertEqual(len(analytics["daily_trend"]), 30)

        csv_text = request_text("/api/v1/complaints/export.csv", token=self.token)
        self.assertIn("id,created_at,company_name", csv_text)
        self.assertIn(first_id, csv_text)

    def test_04_inference_endpoint_predicts_without_creating_complaint(self) -> None:
        prediction = request_json(
            "/api/v1/inference/predict",
            method="POST",
            payload={
                "category": "Security / Privacy",
                "description": "Possible data breach with unauthorized login activity.",
            },
        )
        self.assertIn(prediction["urgency"], {"High", "Medium", "Low"})
        self.assertEqual(prediction["predicted_category"], "Security / Privacy")
        self.assertIn(prediction["provider"], {"rules", "sklearn", "keras"})


if __name__ == "__main__":
    try:
        unittest.main(verbosity=2)
    except RuntimeError as exc:
        print(exc, file=sys.stderr)
        sys.exit(1)
