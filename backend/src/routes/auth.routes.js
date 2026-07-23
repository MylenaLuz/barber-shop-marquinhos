const express = require("express");
const { verifyPassword, changePassword } = require("../models/user.model");
const { signToken, requireAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/login", (req, res) => {
  const { password } = req.body || {};
  if (!password) return res.status(400).json({ error: "Informe a senha." });
  if (!verifyPassword(password)) return res.status(401).json({ error: "Senha incorreta." });
  const token = signToken();
  res.json({ token });
});

router.post("/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!verifyPassword(currentPassword)) return res.status(401).json({ error: "Senha atual incorreta." });
  if (!newPassword || newPassword.length < 4)
    return res.status(400).json({ error: "A nova senha precisa ter ao menos 4 caracteres." });
  changePassword(newPassword);
  res.json({ ok: true });
});

module.exports = router;
