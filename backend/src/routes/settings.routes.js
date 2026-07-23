const express = require("express");
const { requireAuth } = require("../middleware/auth");
const Settings = require("../models/settings.model");

const router = express.Router();

router.get("/", async (req, res) => res.json(await Settings.getSettings()));

router.put("/", requireAuth, async (req, res) => {
  const updated = await Settings.updateSettings(req.body || {});
  res.json(updated);
});

module.exports = router;
