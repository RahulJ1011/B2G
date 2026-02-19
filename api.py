"""
Crime Severity Prediction API
==============================
FastAPI REST wrapper for the trained crime severity ML model.

Run:
    pip install fastapi uvicorn scikit-learn joblib pandas numpy
    python api.py

Endpoints:
    POST /predict        → Predict severity from user input
    GET  /crime-types    → List valid crime types
    GET  /locations      → List valid location types
    GET  /model-info     → Model metadata & performance
    GET  /health         → Health check
"""

import os
import re
import joblib
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# ─────────────────────────────────────────
# Load model artifacts
# ─────────────────────────────────────────
ARTIFACT_DIR = os.path.join(os.path.dirname(__file__), "artifacts")

try:
    model    = joblib.load(f"{ARTIFACT_DIR}/crime_severity_model.pkl")
    scaler   = joblib.load(f"{ARTIFACT_DIR}/scaler.pkl")
    le_crime = joblib.load(f"{ARTIFACT_DIR}/le_crime.pkl")
    le_loc   = joblib.load(f"{ARTIFACT_DIR}/le_location.pkl")
    le_label = joblib.load(f"{ARTIFACT_DIR}/le_label.pkl")
    meta     = joblib.load(f"{ARTIFACT_DIR}/model_meta.pkl")
    print(f"✅ Loaded model: {meta['name']} | Test Accuracy: {meta['test_accuracy']:.4f}")
except FileNotFoundError:
    raise RuntimeError("❌ Model artifacts not found. Run train_model.py first.")

# ─────────────────────────────────────────
# Historical reference tables
# ─────────────────────────────────────────
CRIME_PROFILES = {
    "Theft":          {"base_severity": 42, "historical_freq": 78, "trend": 1},
    "Assault":        {"base_severity": 68, "historical_freq": 45, "trend": 0},
    "Burglary":       {"base_severity": 61, "historical_freq": 33, "trend": -1},
    "Robbery":        {"base_severity": 74, "historical_freq": 22, "trend": 1},
    "Vandalism":      {"base_severity": 28, "historical_freq": 91, "trend": 0},
    "Fraud":          {"base_severity": 52, "historical_freq": 55, "trend": 1},
    "Drug Offense":   {"base_severity": 55, "historical_freq": 67, "trend": 0},
    "Murder":         {"base_severity": 98, "historical_freq": 4,  "trend": 0},
    "Sexual Assault": {"base_severity": 91, "historical_freq": 18, "trend": 0},
    "Kidnapping":     {"base_severity": 95, "historical_freq": 6,  "trend": 0},
}

LOCATION_RISK = {
    "Residential Area":       40,
    "Commercial Zone":        55,
    "Public Transport Hub":   65,
    "Park / Open Space":      45,
    "Industrial Area":        50,
    "School / University":    70,
    "Night District":         75,
    "Highway / Remote Area":  60,
}

TREND_MAP = {"increasing": 1, "stable": 0, "decreasing": -1}
TREND_LABEL = {1: "increasing", 0: "stable", -1: "decreasing"}


# ─────────────────────────────────────────
# Description keyword extractor
# ─────────────────────────────────────────
def extract_description_features(description: str) -> dict:
    desc = description.lower()
    return {
        "has_weapon":         int(bool(re.search(r"weapon|gun|knife|firearm|pistol|rifle|blade", desc))),
        "has_injury":         int(bool(re.search(r"injur|blood|wound|hurt|hospitaliz|dead|death", desc))),
        "multiple_suspects":  int(bool(re.search(r"multiple|gang|group|several|two|three|four", desc))),
        "involves_minor":     int(bool(re.search(r"child|minor|kid|teen|juvenile|underage|school student", desc))),
        "night_time":         int(bool(re.search(r"night|dark|midnight|2am|3am|late evening|after dark", desc))),
        "threat_made":        int(bool(re.search(r"threat|threaten|warn|intimidat|demand", desc))),
    }


# ─────────────────────────────────────────
# FastAPI App
# ─────────────────────────────────────────
app = FastAPI(
    title="Crime Severity Prediction API",
    description="Predicts crime severity level using ML model trained on historical crime data.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────
# Request / Response Schemas
# ─────────────────────────────────────────
class CrimeInput(BaseModel):
    crime_type: str = Field(..., example="Assault", description="Type of crime committed")
    location: str = Field(..., example="School / University", description="Location type of the incident")
    description: str = Field(..., min_length=10, example="Suspect armed with knife threatened multiple students at night", description="Detailed description of the incident")
    reporter_name: Optional[str] = Field(None, example="John Doe")
    incident_datetime: Optional[str] = Field(None, example="2025-03-15T22:30:00")

class SeverityResponse(BaseModel):
    case_id: str
    reported_at: str
    reporter_name: Optional[str]
    incident_datetime: Optional[str]

    # Input summary
    crime_type: str
    location: str
    description: str

    # Prediction
    severity_label: str
    severity_score_estimate: float
    confidence: float
    label_probabilities: dict

    # Feature breakdown
    description_flags: dict
    historical_context: dict
    location_context: dict

    # Model info
    model_used: str
    recommendation: str


# ─────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────
def make_case_id():
    return "CR-" + datetime.now().strftime("%Y%m%d%H%M%S")

def get_recommendation(label: str) -> str:
    return {
        "CRITICAL": "🚨 IMMEDIATE response required. Dispatch units now. Notify senior officers and relevant departments.",
        "HIGH":     "⚠️  Priority response needed. Assign lead investigator. Begin evidence collection immediately.",
        "MEDIUM":   "📋 Standard investigation protocol. Schedule follow-up within 24 hours.",
        "LOW":      "📝 Log incident and monitor. Assign for routine follow-up.",
    }.get(label, "Review incident manually.")

def score_estimate(label: str, proba: dict) -> float:
    """Heuristic score estimate from label + confidence."""
    centers = {"LOW": 25, "MEDIUM": 50, "HIGH": 70, "CRITICAL": 90}
    base = centers.get(label, 50)
    confidence = proba.get(label, 0.5)
    return round(base + (confidence - 0.5) * 15, 1)


# ─────────────────────────────────────────
# Endpoints
# ─────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "model": meta["name"], "accuracy": meta["test_accuracy"]}


@app.get("/model-info")
def model_info():
    return {
        "model_name": meta["name"],
        "test_accuracy": round(meta["test_accuracy"], 4),
        "features": meta["feature_cols"],
        "severity_labels": list(le_label.classes_),
        "supported_crime_types": list(CRIME_PROFILES.keys()),
        "supported_locations": list(LOCATION_RISK.keys()),
    }


@app.get("/crime-types")
def crime_types():
    return {
        "crime_types": [
            {"name": k, "base_severity": v["base_severity"], "trend": TREND_LABEL[v["trend"]], "historical_freq": v["historical_freq"]}
            for k, v in CRIME_PROFILES.items()
        ]
    }


@app.get("/locations")
def locations():
    return {
        "locations": [{"name": k, "risk_index": v} for k, v in LOCATION_RISK.items()]
    }


@app.post("/predict", response_model=SeverityResponse)
def predict(payload: CrimeInput):
    # Validate inputs
    if payload.crime_type not in CRIME_PROFILES:
        raise HTTPException(status_code=422, detail=f"Invalid crime_type. Valid: {list(CRIME_PROFILES.keys())}")
    if payload.location not in LOCATION_RISK:
        raise HTTPException(status_code=422, detail=f"Invalid location. Valid: {list(LOCATION_RISK.keys())}")

    profile  = CRIME_PROFILES[payload.crime_type]
    loc_risk = LOCATION_RISK[payload.location]

    # Encode categorical features
    crime_enc = le_crime.transform([payload.crime_type])[0]
    loc_enc   = le_loc.transform([payload.location])[0]

    # Extract description signals
    desc_flags = extract_description_features(payload.description)

    # Build feature vector (same order as training)
    features = np.array([[
        crime_enc,
        loc_enc,
        profile["historical_freq"],
        profile["trend"],
        profile["base_severity"],
        loc_risk,
        desc_flags["has_weapon"],
        desc_flags["has_injury"],
        desc_flags["multiple_suspects"],
        desc_flags["involves_minor"],
        desc_flags["night_time"],
        desc_flags["threat_made"],
    ]])

    features_scaled = scaler.transform(features)

    # Predict
    pred_idx   = model.predict(features_scaled)[0]
    pred_proba = model.predict_proba(features_scaled)[0]
    label      = le_label.inverse_transform([pred_idx])[0]

    label_proba = {le_label.classes_[i]: round(float(p), 4) for i, p in enumerate(pred_proba)}
    confidence  = round(float(pred_proba[pred_idx]), 4)

    return SeverityResponse(
        case_id=make_case_id(),
        reported_at=datetime.now().isoformat(),
        reporter_name=payload.reporter_name,
        incident_datetime=payload.incident_datetime,
        crime_type=payload.crime_type,
        location=payload.location,
        description=payload.description,
        severity_label=label,
        severity_score_estimate=score_estimate(label, {k: v for k, v in label_proba.items()}),
        confidence=confidence,
        label_probabilities=label_proba,
        description_flags={k: bool(v) for k, v in desc_flags.items()},
        historical_context={
            "historical_frequency": profile["historical_freq"],
            "base_crime_severity": profile["base_severity"],
            "trend": TREND_LABEL[profile["trend"]],
        },
        location_context={
            "location": payload.location,
            "risk_index": loc_risk,
        },
        model_used=meta["name"],
        recommendation=get_recommendation(label),
    )


# ─────────────────────────────────────────
# Run server
# ─────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
