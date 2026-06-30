const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "DriveMind Backend",
    message: "Backend health check passed"
  });
});

module.exports = router;