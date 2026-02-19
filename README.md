# Crime Severity Prediction — ML Model & API

## Overview
An end-to-end ML system that predicts crime severity (`LOW / MEDIUM / HIGH / CRITICAL`) based on:
- **Current user input** — crime type, location, incident description
- **Historical crime data** — past frequency, base severity, crime trend (as weighted features)

---

## Files
```
crime_model/
├── train_model.py       # Data generation, model selection & training
├── api.py               # FastAPI REST API
├── requirements.txt     # Python dependencies
├── artifacts/           # Saved model & encoders (auto-generated)
│   ├── crime_severity_model.pkl
│   ├── scaler.pkl
│   ├── le_crime.pkl
│   ├── le_location.pkl
│   ├── le_label.pkl
│   └── model_meta.pkl
```

---

## Setup & Run

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Train the model
```bash
python train_model.py
```
This will:
- Generate 5000 synthetic training samples
- Benchmark 4 ML algorithms via 5-fold cross-validation
- Auto-select the best model
- Save trained model + preprocessors to `./artifacts/`

### 3. Start the API
```bash
python api.py
# API runs at http://localhost:8000
# Docs at  http://localhost:8000/docs
```

---

## API Endpoints

| Method | Endpoint        | Description                        |
|--------|-----------------|------------------------------------|
| POST   | `/predict`      | Predict severity from crime input  |
| GET    | `/crime-types`  | List valid crime types             |
| GET    | `/locations`    | List valid location types          |
| GET    | `/model-info`   | Model name, accuracy, features     |
| GET    | `/health`       | Health check                       |

---

## Example Request

```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "crime_type": "Assault",
    "location": "School / University",
    "description": "Suspect armed with knife threatened multiple students at night",
    "reporter_name": "Jane Doe",
    "incident_datetime": "2025-03-15T22:30:00"
  }'
```

## Example Response
```json
{
  "case_id": "CR-20250315223012",
  "severity_label": "CRITICAL",
  "severity_score_estimate": 91.5,
  "confidence": 0.9823,
  "label_probabilities": {
    "CRITICAL": 0.9823,
    "HIGH": 0.0142,
    "MEDIUM": 0.0031,
    "LOW": 0.0004
  },
  "description_flags": {
    "has_weapon": true,
    "has_injury": false,
    "multiple_suspects": true,
    "involves_minor": true,
    "night_time": true,
    "threat_made": true
  },
  "historical_context": {
    "historical_frequency": 45,
    "base_crime_severity": 68,
    "trend": "stable"
  },
  "location_context": {
    "location": "School / University",
    "risk_index": 70
  },
  "recommendation": "🚨 IMMEDIATE response required. Dispatch units now."
}
```

---

## How Severity is Determined

| Parameter | Source | Weight |
|---|---|---|
| Crime type base severity | Historical DB | High |
| Historical crime frequency | Historical DB | Medium |
| Historical crime trend | Historical DB | Medium |
| Location risk index | Reference table | Medium |
| Weapon / injury / suspects | User description (NLP flags) | High |
| Involves minor / night / threat | User description (NLP flags) | Medium |

The model was auto-selected by comparing **Random Forest, Gradient Boosting, Logistic Regression, and SVM** via 5-fold cross-validation.

---

## Plugging in Real Data
Replace the `CRIME_PROFILES` and `LOCATION_RISK` dictionaries in both files with data from your actual crime database to make predictions fully data-driven.
```
