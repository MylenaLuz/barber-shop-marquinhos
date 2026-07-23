const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "troque-este-segredo-em-producao";

function signToken() {
  return jwt.sign({ role: "admin" }, JWT_SECRET, { expiresIn: "12h" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Token não informado." });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Token inválido ou expirado." });
  }
}

module.exports = { signToken, requireAuth, JWT_SECRET };
