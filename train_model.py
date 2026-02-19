"""
Crime Severity Prediction Model
================================
- Generates synthetic training data based on historical crime patterns
- Trains multiple ML models and selects the best one automatically
- Saves the best model + preprocessors for API use
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score
import warnings
warnings.filterwarnings("ignore")

# ─────────────────────────────────────────
# 1. SYNTHETIC DATA GENERATION
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

def severity_to_label(score):
    if score >= 80: return "CRITICAL"
    elif score >= 60: return "HIGH"
    elif score >= 40: return "MEDIUM"
    else: return "LOW"

def generate_dataset(n_samples=5000, random_state=42):
    np.random.seed(random_state)
    records = []

    crime_types = list(CRIME_PROFILES.keys())
    locations   = list(LOCATION_RISK.keys())

    for _ in range(n_samples):
        crime_type = np.random.choice(crime_types)
        location   = np.random.choice(locations)
        profile    = CRIME_PROFILES[crime_type]

        # Features
        has_weapon      = np.random.choice([0, 1], p=[0.7, 0.3])
        has_injury      = np.random.choice([0, 1], p=[0.6, 0.4])
        multiple_suspects = np.random.choice([0, 1], p=[0.65, 0.35])
        involves_minor  = np.random.choice([0, 1], p=[0.85, 0.15])
        night_time      = np.random.choice([0, 1], p=[0.55, 0.45])
        threat_made     = np.random.choice([0, 1], p=[0.6, 0.4])

        base      = profile["base_severity"]
        hist_freq = profile["historical_freq"]
        trend     = profile["trend"]        # -1 dec, 0 stable, +1 inc
        loc_risk  = LOCATION_RISK[location]

        # Compute score (same logic as frontend, with noise)
        score = (
            base
            + trend * 8
            + loc_risk * 0.25
            + has_weapon      * 15
            + has_injury      * 10
            + multiple_suspects * 10
            + involves_minor  * 12
            + night_time      * 5
            + threat_made     * 7
            - (hist_freq / 100) * 6
            + np.random.normal(0, 4)   # real-world noise
        )
        score = np.clip(score, 1, 100)
        label = severity_to_label(score)

        records.append({
            "crime_type":          crime_type,
            "location":            location,
            "historical_freq":     hist_freq,
            "historical_trend":    trend,        # -1 / 0 / 1
            "base_crime_severity": base,
            "location_risk":       loc_risk,
            "has_weapon":          has_weapon,
            "has_injury":          has_injury,
            "multiple_suspects":   multiple_suspects,
            "involves_minor":      involves_minor,
            "night_time":          night_time,
            "threat_made":         threat_made,
            "severity_score":      round(score, 2),
            "severity_label":      label,
        })

    return pd.DataFrame(records)


# ─────────────────────────────────────────
# 2. PREPROCESSING
# ─────────────────────────────────────────

def preprocess(df, le_crime=None, le_loc=None, le_label=None, fit=True):
    df = df.copy()
    if fit:
        le_crime = LabelEncoder().fit(df["crime_type"])
        le_loc   = LabelEncoder().fit(df["location"])
        le_label = LabelEncoder().fit(["LOW", "MEDIUM", "HIGH", "CRITICAL"])

    df["crime_type_enc"] = le_crime.transform(df["crime_type"])
    df["location_enc"]   = le_loc.transform(df["location"])

    feature_cols = [
        "crime_type_enc", "location_enc",
        "historical_freq", "historical_trend", "base_crime_severity",
        "location_risk", "has_weapon", "has_injury",
        "multiple_suspects", "involves_minor", "night_time", "threat_made",
    ]

    X = df[feature_cols].values
    y = le_label.transform(df["severity_label"]) if "severity_label" in df.columns else None

    return X, y, le_crime, le_loc, le_label


# ─────────────────────────────────────────
# 3. MODEL SELECTION — AUTO PICK BEST
# ─────────────────────────────────────────

CANDIDATES = {
    "Random Forest":          RandomForestClassifier(n_estimators=200, max_depth=12, random_state=42, n_jobs=-1),
    "Gradient Boosting":      GradientBoostingClassifier(n_estimators=150, max_depth=5, random_state=42),
    "Logistic Regression":    LogisticRegression(max_iter=1000, random_state=42),
    "SVM":                    SVC(kernel="rbf", probability=True, random_state=42),
}

def train_and_select(X_train, y_train):
    print("\n📊 Running cross-validation on all candidate models...\n")
    best_name, best_score, best_model = None, 0, None

    for name, clf in CANDIDATES.items():
        cv_scores = cross_val_score(clf, X_train, y_train, cv=5, scoring="accuracy", n_jobs=-1)
        mean_cv = cv_scores.mean()
        print(f"  {name:<25} CV Accuracy: {mean_cv:.4f} ± {cv_scores.std():.4f}")
        if mean_cv > best_score:
            best_score, best_name, best_model = mean_cv, name, clf

    print(f"\n✅ Best model: {best_name} (CV Accuracy: {best_score:.4f})")
    best_model.fit(X_train, y_train)
    return best_name, best_model


# ─────────────────────────────────────────
# 4. MAIN TRAINING PIPELINE
# ─────────────────────────────────────────

def main():
    os.makedirs("artifacts", exist_ok=True)

    print("🔧 Generating synthetic crime dataset (5000 samples)...")
    df = generate_dataset(5000)
    print(f"   Dataset shape: {df.shape}")
    print(f"   Label distribution:\n{df['severity_label'].value_counts().to_string()}\n")

    X, y, le_crime, le_loc, le_label = preprocess(df, fit=True)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s  = scaler.transform(X_test)

    best_name, best_model = train_and_select(X_train_s, y_train)

    # Final evaluation on held-out test set
    y_pred = best_model.predict(X_test_s)
    test_acc = accuracy_score(y_test, y_pred)
    print(f"\n📈 Test Set Accuracy: {test_acc:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=le_label.classes_))

    # Save artifacts
    joblib.dump(best_model, "artifacts/crime_severity_model.pkl")
    joblib.dump(scaler,     "artifacts/scaler.pkl")
    joblib.dump(le_crime,   "artifacts/le_crime.pkl")
    joblib.dump(le_loc,     "artifacts/le_location.pkl")
    joblib.dump(le_label,   "artifacts/le_label.pkl")
    joblib.dump({"name": best_name, "test_accuracy": test_acc, "feature_cols": [
        "crime_type_enc", "location_enc", "historical_freq", "historical_trend",
        "base_crime_severity", "location_risk", "has_weapon", "has_injury",
        "multiple_suspects", "involves_minor", "night_time", "threat_made",
    ]}, "artifacts/model_meta.pkl")

    print("\n✅ Model & artifacts saved to ./artifacts/")
    return test_acc

if __name__ == "__main__":
    main()
