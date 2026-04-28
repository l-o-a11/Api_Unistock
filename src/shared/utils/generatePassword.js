const CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#$!";

function generatePassword(length = 10) {
  let pwd =
    "ABCDEFGHJKMNPQRSTUVWXYZ"[Math.floor(Math.random() * 23)] +
    "abcdefghjkmnpqrstuvwxyz"[Math.floor(Math.random() * 23)] +
    "23456789"[Math.floor(Math.random() * 8)] +
    "@#$!"[Math.floor(Math.random() * 4)];

  for (let i = pwd.length; i < length; i++) {
    pwd += CHARS[Math.floor(Math.random() * CHARS.length)];
  }

  return pwd
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

module.exports = { generatePassword };