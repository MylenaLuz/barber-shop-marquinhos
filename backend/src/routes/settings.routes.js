const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Settings = require("../models/settings.model");

const router = express.Router();

router.get("/", (req, res) => res.json(Settings.getSettings()));

router.put("/", requireAuth, (req, res) => {
  const updated = Settings.updateSettings(req.body || {});
  res.json(updated);
});

module.exports = router;
