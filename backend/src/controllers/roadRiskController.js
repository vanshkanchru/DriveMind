const Experience = require("../models/Experience");

const getRoadRiskSummary = async (req, res) => {
  try {
    const { roadSegmentId } = req.params;

    const experiences = await Experience.find({ roadSegmentId }).sort({
      createdAt: -1
    });

    if (experiences.length === 0) {
      return res.json({
        success: true,
        roadSegmentId,
        riskLevel: "low",
        riskScore: 0,
        experienceCount: 0,
        message: "No risky experiences found for this road segment",
        recommendation: "continue_normal_driving"
      });
    }

    const totalRisk = experiences.reduce(
      (sum, experience) => sum + experience.riskScore,
      0
    );

    const averageRiskScore = Number((totalRisk / experiences.length).toFixed(2));

    let riskLevel = "low";

    if (averageRiskScore > 0.8) {
      riskLevel = "critical";
    } else if (averageRiskScore > 0.6) {
      riskLevel = "high";
    } else if (averageRiskScore > 0.3) {
      riskLevel = "medium";
    }

    const eventCounts = {};

    experiences.forEach((experience) => {
      eventCounts[experience.eventType] =
        (eventCounts[experience.eventType] || 0) + 1;
    });

    const mostCommonEvent = Object.keys(eventCounts).reduce((a, b) =>
      eventCounts[a] > eventCounts[b] ? a : b
    );

    const latestExperience = experiences[0];

    res.json({
      success: true,
      roadSegmentId,
      riskLevel,
      riskScore: averageRiskScore,
      experienceCount: experiences.length,
      mostCommonEvent,
      latestReason: latestExperience.reason,
      recommendation: latestExperience.recommendedAction,
      confidence: latestExperience.confidence
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to calculate road risk summary",
      error: error.message
    });
  }
};

module.exports = {
  getRoadRiskSummary
};