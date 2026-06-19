from __future__ import annotations

import re
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Protocol

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


class KerasUrgencyProvider:
    provider = "keras"

    def __init__(
        self,
        model_path: Path,
        tokenizer_path: Path,
        max_len: int,
        labels: list[str],
    ) -> None:
        import pickle

        import numpy as np
        from tensorflow.keras.models import load_model
        from tensorflow.keras.preprocessing.sequence import pad_sequences

        self.model_path = model_path
        self.tokenizer_path = tokenizer_path
        self.max_len = max_len
        self.labels = labels
        self.np = np
        self.pad_sequences = pad_sequences
        self.model = load_model(model_path, compile=False)
        with tokenizer_path.open("rb") as file:
            tokenizer_artifact: Any = pickle.load(file)
        self.tokenizer = self._extract_tokenizer(tokenizer_artifact)
        self.rule_provider = RuleBasedInferenceProvider()
        self.version = f"keras:{model_path.name}"

    @staticmethod
    def _extract_tokenizer(artifact: Any) -> Any:
        if hasattr(artifact, "texts_to_sequences"):
            return artifact
        if isinstance(artifact, dict):
            for key in ("tokenizer", "text_tokenizer", "keras_tokenizer"):
                candidate = artifact.get(key)
                if hasattr(candidate, "texts_to_sequences"):
                    return candidate
        raise ValueError("Keras tokenizer artifact must contain a Tokenizer with texts_to_sequences().")

    def predict(self, description: str, category: str | None = None) -> Prediction:
        started = time.perf_counter()
        cleaned_text = normalize_keras_text(description)
        sequences = self.tokenizer.texts_to_sequences([cleaned_text])
        padded = self.pad_sequences(
            sequences,
            maxlen=self.max_len,
            padding="post",
            truncating="post",
        )
        probabilities = self.model.predict(padded, verbose=0)[0]
        class_index = int(self.np.argmax(probabilities))
        fallback = self.rule_provider.predict(description=description, category=category)
        urgency = self.labels[class_index] if class_index < len(self.labels) else fallback.urgency
        confidence = float(probabilities[class_index])
        latency_ms = (time.perf_counter() - started) * 1000
        return Prediction(
            urgency=urgency,
            sentiment=fallback.sentiment,
            predicted_category=fallback.predicted_category,
            confidence=round(min(max(confidence, 0.0), 1.0), 2),
            provider=self.provider,
            version=self.version,
            latency_ms=round(latency_ms, 3),
            reasons=["keras_urgency_model", *fallback.reasons],
        )


def normalize_keras_text(text: str) -> str:
    cleaned = normalize_text(text)
    cleaned = re.sub(r"'", "", cleaned)
    cleaned = re.sub(r"[^a-z\s]", " ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned.strip()


class InferenceService:
    def __init__(self) -> None:
        settings = get_settings()
        keras_model = Path(settings.keras_model_path).expanduser() if settings.keras_model_path else None
        keras_tokenizer = Path(settings.keras_tokenizer_path).expanduser() if settings.keras_tokenizer_path else None
        keras_label_encoder = (
            Path(settings.keras_label_encoder_path).expanduser()
            if settings.keras_label_encoder_path
            else None
        )
        sklearn_artifact = (
            Path(settings.sklearn_pipeline_path).expanduser()
            if settings.sklearn_pipeline_path
            else None
        )
        if keras_model and keras_tokenizer and keras_model.exists() and keras_tokenizer.exists():
            try:
                self.provider: InferenceProvider = KerasUrgencyProvider(
                    model_path=keras_model,
                    tokenizer_path=keras_tokenizer,
                    max_len=settings.keras_max_len,
                    labels=self._load_keras_labels(keras_label_encoder, settings.keras_label_list),
                )
            except Exception:
                self.provider = RuleBasedInferenceProvider()
        elif sklearn_artifact and sklearn_artifact.exists():
            self.provider = SklearnPipelineProvider(sklearn_artifact)
        else:
            self.provider = RuleBasedInferenceProvider()

    def predict(self, description: str, category: str | None = None) -> Prediction:
        return self.provider.predict(description=description, category=category)

    @staticmethod
    def _load_keras_labels(label_encoder_path: Path | None, default_labels: list[str]) -> list[str]:
        if label_encoder_path and label_encoder_path.exists():
            import pickle

            try:
                with label_encoder_path.open("rb") as file:
                    label_encoder = pickle.load(file)
                classes = getattr(label_encoder, "classes_", None)
                if classes is not None:
                    return [str(label) for label in classes]
            except Exception:
                return default_labels
        return default_labels


_service: InferenceService | None = None


def get_inference_service() -> InferenceService:
    global _service
    if _service is None:
        _service = InferenceService()
    return _service
