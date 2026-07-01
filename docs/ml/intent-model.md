# DriveMind Intent Prediction Model

## 1. Purpose

The intent prediction model predicts the future behavior of a vehicle using telemetry data.

It predicts one of the following intents:

- brake
- accelerate
- turn_left
- turn_right
- lane_change
- normal

---

## 2. Current MVP Dataset

The current MVP model is trained on synthetic telemetry data.

The synthetic dataset is generated using:

```text
ai-service/data/generate_intent_data.py
```

Generated features:

- speed
- acceleration
- brakePressure
- steeringAngle
- laneOffset
- distanceToFrontVehicle

Target label:

```text
intent
```

---

## 3. Important Note About Data

The current synthetic dataset is used only for MVP pipeline validation.

It helps us test:

- model training
- FastAPI prediction service
- backend-AI integration
- telemetry-to-intent flow

For the final resume-level version, the model should be upgraded using:

1. CARLA-generated driving telemetry
2. Real-world trajectory-derived features

---

## 4. Model Used

Current model:

```text
Random Forest Classifier
```

Reason:

- works well on tabular telemetry data
- fast to train
- easy to explain
- good baseline model for MVP
- supports probability-based confidence score

---

## 5. Model Input

Example input:

```json
{
  "speed": 72,
  "acceleration": -1.6,
  "brakePressure": 0.82,
  "steeringAngle": 22,
  "laneOffset": 0.41,
  "distanceToFrontVehicle": 7
}
```

---

## 6. Model Output

Example output:

```json
{
  "success": true,
  "predictedIntent": "brake",
  "confidence": 0.97
}
```

---

## 7. Current Evaluation Result

The current MVP model achieved:

```text
Accuracy: 98.40%
Macro F1-score: 0.97
Weighted F1-score: 0.98
```

This score is high because the current dataset is synthetic and rule-generated.

This result should not be claimed as real-world driving performance.

---

## 8. Final Data Upgrade Plan

Final version data plan:

```text
Synthetic data
    ↓
CARLA-generated telemetry
    ↓
Real-world trajectory-derived features
```

The final project should clearly mention that synthetic data was used for initial pipeline validation and realistic/real-world data is planned for the final model upgrade.

---

## 9. AI Service Endpoint

The FastAPI service exposes:

```http
POST /predict-intent
```

Full local URL:

```text
http://127.0.0.1:8000/predict-intent
```

---

## 10. Backend Integration

The Node.js backend calls the AI service during telemetry ingestion.

Flow:

```text
Vehicle sends telemetry
        ↓
Backend receives telemetry
        ↓
Backend sends telemetry to AI service
        ↓
AI returns predicted intent
        ↓
Backend calculates risk
        ↓
Backend stores experience memory if risk is high
```