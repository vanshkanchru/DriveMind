const calculateRiskFromTelemetry = (telemetry) => {
  let riskScore = 0;
  const reasons = [];
  const events = [];

  if (telemetry.speed > 60) {
    riskScore += 0.2;
    reasons.push("vehicle_speed_high");
    events.push("high_speed_risk");
  }

  if (telemetry.brakePressure > 0.7 && telemetry.acceleration < -1) {
    riskScore += 0.25;
    reasons.push("sudden_braking_detected");
    events.push("sudden_braking");
  }

  if (Math.abs(telemetry.steeringAngle) > 15 && telemetry.speed > 45) {
    riskScore += 0.2;
    reasons.push("sharp_turn_at_speed");
    events.push("sharp_turn_risk");
  }

  if (telemetry.distanceToFrontVehicle < 10 && telemetry.speed > 40) {
    riskScore += 0.25;
    reasons.push("unsafe_following_distance");
    events.push("near_miss");
  }

  if (telemetry.weather === "rain" || telemetry.weather === "fog") {
    riskScore += 0.1;
    reasons.push("bad_weather_condition");

    if (telemetry.weather === "fog") {
      events.push("low_visibility");
    }
  }

  riskScore = Math.min(riskScore, 1);

  let riskLevel = "low";

  if (riskScore > 0.8) {
    riskLevel = "critical";
  } else if (riskScore > 0.6) {
    riskLevel = "high";
  } else if (riskScore > 0.3) {
    riskLevel = "medium";
  }

  const recommendedAction =
    riskLevel === "critical"
      ? "reduce_speed_immediately_and_increase_following_distance"
      : riskLevel === "high"
      ? "reduce_speed_by_25_percent"
      : riskLevel === "medium"
      ? "drive_with_caution"
      : "continue_normal_driving";

  return {
    riskScore,
    riskLevel,
    reasons,
    events: [...new Set(events)],
    recommendedAction,
    confidence: Number((0.7 + riskScore * 0.25).toFixed(2))
  };
};

module.exports = {
  calculateRiskFromTelemetry
};