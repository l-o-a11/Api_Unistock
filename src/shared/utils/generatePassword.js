const LOWERCASE = "abcdefghijkmnpqrstuvwxyz";
const UPPERCASE = "ABCDEFGHJKMNPQRSTUVWXYZ";
const NUMBERS   = "23456789";
const SPECIALS  = "*-_#~$";
const ALL       = LOWERCASE + UPPERCASE + NUMBERS + SPECIALS;

function generatePassword() {
  // Garantiza mínimo 1 de cada tipo
  let pwd =
    LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)] +
    UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)] +
    NUMBERS[Math.floor(Math.random() * NUMBERS.length)] +
    SPECIALS[Math.floor(Math.random() * SPECIALS.length)];

  // Rellena hasta 8 caracteres con mezcla libre
  for (let i = pwd.length; i < 8; i++) {
    pwd += ALL[Math.floor(Math.random() * ALL.length)];
  }

  // Mezcla para que los obligatorios no queden siempre al inicio
  return pwd.split("").sort(() => Math.random() - 0.5).join("");
}

module.exports = { generatePassword };