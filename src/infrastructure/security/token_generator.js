// infrastructure/security/token_generator.js
// Genera y verifica JWT.

const jwt = require("jsonwebtoken");

const secret = () => (process.env.JWT_SECRET || "unistock_secret").trim();
const expires = process.env.JWT_EXPIRES_IN || "8h";

const generate = (payload) =>
  jwt.sign(payload, secret(), { expiresIn: expires });
const verify = (token) => jwt.verify(token, secret());

module.exports = { generate, verify };