const express = require("express");
const { createTelemetry } = require("../controllers/telemetryController");
const verifyVehicle = require("../middleware/vehicleAuthMiddleware");

const router = express.Router();

router.post("/", verifyVehicle, createTelemetry);

module.exports = router;