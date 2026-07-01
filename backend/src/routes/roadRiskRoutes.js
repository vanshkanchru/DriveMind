const express = require("express");
const { getRoadRiskSummary } = require("../controllers/roadRiskController");

const router = express.Router();

router.get("/:roadSegmentId", getRoadRiskSummary);

module.exports = router;