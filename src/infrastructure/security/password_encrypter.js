// infrastructure/security/password_encrypter.js
// Encapsula bcrypt para no depender directamente en los use-cases.

const bcrypt = require("bcryptjs");

const ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

const hash = (plain) => bcrypt.hash(plain, ROUNDS);
const compare = (plain, hashed) => bcrypt.compare(plain, hashed);

module.exports = { hash, compare };