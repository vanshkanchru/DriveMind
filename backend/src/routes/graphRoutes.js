const express = require("express");
const { getGraphOverview } = require("../controllers/graphController");

const router = express.Router();

router.get("/", getGraphOverview);

module.exports = router;