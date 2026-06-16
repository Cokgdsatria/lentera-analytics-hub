from __future__ import annotations

import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Protocol

from app.core.config import get_settings


@dataclass(frozen=True)
class Prediction:
    urgency: str
    sentiment: str
    predicted_category: str
    confidence: float
    provider: str
    version: str
    latency_ms: float
    reasons: list[str]


class InferenceProvider(Protocol):
    provider: str
    version: str

    def predict(self, description: str, category: str | None = None) -> Prediction:
        ...


def normalize_text(text: str) -> str:
    lowered = text.lower()
    lowered = re.sub(r"x{2,}", " ", lowered)
    lowered = re.sub(r"\s+", " ", lowered)
    return lowered.strip()


class RuleBasedInferenceProvider:
    provider = "rules"
    version = "rules-v1"

    high_terms = {
        "breach",
        "data leak",
        "hacked",
        "fraud",
        "scam",
        "stolen",
        "unauthorized",
        "illegal",
        "threat",
        "lawsuit",
        "harassment",
        "privacy",
        "security",
    }
    medium_terms = {
        "refund",
        "overcharged",
        "double charged",
        "wrong amount",
        "late fee",
        "unresolved",
        "cannot access",
        "can't access",
        "error",
        "failed",
        "down",
        "latency",
    }
    negative_terms = {
        "bad",
        "angry",
        "disappointed",
        "failed",
        "slow",
        "problem",
        "issue",
        "complaint",
        "unresolved",
        "unsafe",
        "breach",
        "fraud",
    }
    positive_terms = {
        "thanks",
        "resolved",
        "helpful",
        "good",
        "great",
        "appreciate",
    }
    category_rules = {
        "Security / Privacy": {
            "breach",
            "privacy",
            "security",
            "hacked",
            "unauthorized",
            "password",
            "leak",
            "identity",
        },
        "System Glitch": {
            "bug",
            "error",
            "crash",
            "latency",
            "slow",
            "failed",
            "cannot access",
            "can't access",
            "down",
        },
        "Customer Service": {
            "support",
            "agent",
            "response",
            "rude",
            "service",
            "call center",
            "ignored",
        },
        "Infrastructure Issue": {
            "network",
            "server",
            "facility",
            "power",
            "outage",
            "infrastructure",
        },
        "Billing Dispute": {
            "billing",
            "invoice",
            "charge",
            "charged",
            "refund",
            "payment",
            "fee",
        },
    }

    def predict(self, description: str, category: str | None = None) -> Prediction:
        started = time.perf_counter()
        text = normalize_text(description)
        reasons: list[str] = []

        high_hits = self._hits(text, self.high_terms)
        medium_hits = self._hits(text, self.medium_terms)
        if high_hits:
            urgency = "High"
            reasons.append(f"high_terms:{','.join(high_hits[:3])}")
        elif medium_hits:
            urgency = "Medium"
            reasons.append(f"medium_terms:{','.join(medium_hits[:3])}")
        else:
            urgency = "Low"
            reasons.append("no_urgent_terms")

        category_scores = {
            label: len(self._hits(text, terms))
            for label, terms in self.category_rules.items()
        }
        best_category, best_score = max(category_scores.items(), key=lambda item: item[1])
        predicted_category = best_category if best_score > 0 else (category or "Other")
        if best_score > 0:
            reasons.append(f"category_terms:{predicted_category}:{best_score}")

        negative_score = len(self._hits(text, self.negative_terms))
        positive_score = len(self._hits(text, self.positive_terms))
        if negative_score > positive_score:
            sentiment = "Negative"
        elif positive_score > negative_score:
            sentiment = "Positive"
        else:
            sentiment = "Neutral"

        confidence = self._confidence(urgency, best_score, negative_score + positive_score)
        latency_ms = (time.perf_counter() - started) * 1000
        return Prediction(
            urgency=urgency,
            sentiment=sentiment,
            predicted_category=predicted_category,
            confidence=confidence,
            provider=self.provider,
            version=self.version,
            latency_ms=round(latency_ms, 3),
            reasons=reasons,
        )

    @staticmethod
    def _hits(text: str, terms: set[str]) -> list[str]:
        return [term for term in terms if term in text]

    @staticmethod
    def _confidence(urgency: str, category_score: int, sentiment_score: int) -> float:
        base = {"High": 0.78, "Medium": 0.68, "Low": 0.58}[urgency]
        score = base + min(category_score, 3) * 0.04 + min(sentiment_score, 3) * 0.02
        return round(min(score, 0.95), 2)


class SklearnPipelineProvider:
    provider = "sklearn"

    def __init__(self, artifact_path: Path) -> None:
        import joblib

        self.artifact_path = artifact_path
        self.pipeline = joblib.load(artifact_path)
        self.version = f"sklearn:{artifact_path.name}"

    def predict(self, description: str, category: str | None = None) -> Prediction:
        started = time.perf_counter()
        text = normalize_text(description)
        raw = self.pipeline.predict([text])[0]

        if isinstance(raw, dict):
            predicted_category = str(raw.get("predicted_category") or raw.get("category") or category or "Other")
            urgency = str(raw.get("urgency") or "Low")
            sentiment = str(raw.get("sentiment") or "Neutral")
            confidence = float(raw.get("confidence") or 0.8)
        else:
            predicted_category = str(raw)
            urgency = "Low"
            sentiment = "Neutral"
            confidence = 0.8

        latency_ms = (time.perf_counter() - started) * 1000
        return Prediction(
            urgency=urgency,
            sentiment=sentiment,
            predicted_category=predicted_category,
            confidence=round(min(max(confidence, 0.0), 1.0), 2),
            provider=self.provider,
            version=self.version,
            latency_ms=round(latency_ms, 3),
            reasons=["model_artifact"],
        )


class InferenceService:
    def __init__(self) -> None:
        settings = get_settings()
        artifact = Path(settings.sklearn_pipeline_path).expanduser() if settings.sklearn_pipeline_path else None
        if artifact and artifact.exists():
            self.provider: InferenceProvider = SklearnPipelineProvider(artifact)
        else:
            self.provider = RuleBasedInferenceProvider()

    def predict(self, description: str, category: str | None = None) -> Prediction:
        return self.provider.predict(description=description, category=category)


_service: InferenceService | None = None


def get_inference_service() -> InferenceService:
    global _service
    if _service is None:
        _service = InferenceService()
    return _service
