const express = require("express");
const { getGraphOverview, getRiskClusters } = require("../controllers/graphController");

const router = express.Router();

router.get("/", getGraphOverview);
router.get("/clusters", getRiskClusters);

module.exports = router;