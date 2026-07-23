const crypto = require("crypto");

function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(4).toString("hex")}`;
}

module.exports = { uid };
