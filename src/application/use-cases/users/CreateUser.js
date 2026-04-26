// application/use-cases/users/CreateUser.js
const bcrypt = require("bcryptjs");
const { generatePassword } = require("../../../shared/utils/generatePassword");

class CreateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(data) {
    const {
      tipoDocumento,
      numeroDocumento,
      nombreCompleto,
      correo,
      rolId,
      sedeId,
      password,
    } = data;

    // Unicidad de correo
    if (this.userRepository.findByEmail(correo)) {
      const error = new Error(
        "Ya existe un usuario con ese correo electrónico",
      );
      error.statusCode = 409;
      throw error;
    }

    // Unicidad de documento
    if (this.userRepository.findByDocument(numeroDocumento)) {
      const error = new Error(
        "Ya existe un usuario con ese número de documento",
      );
      error.statusCode = 409;
      throw error;
    }

    // Rol existe
    if (!this.userRepository.findRoleById(rolId)) {
      const error = new Error("El rol seleccionado no existe");
      error.statusCode = 422;
      throw error;
    }

    // Sede existe
    if (!this.userRepository.findSedeById(sedeId)) {
      const error = new Error("La sede seleccionada no existe");
      error.statusCode = 422;
      throw error;
    }

    const plainPassword = password || generatePassword();
    const hashed = await bcrypt.hash(
      plainPassword,
      parseInt(process.env.BCRYPT_ROUNDS) || 10,
    );

    const user = this.userRepository.save({
      tipoDocumento,
      numeroDocumento,
      nombreCompleto: nombreCompleto.trim(),
      correo,
      password: hashed,
      rolId: parseInt(rolId),
      sedeId: parseInt(sedeId),
      estado: true,
    });

    // Devolvemos la contraseña en texto plano solo aquí para que el
    // frontend pueda enviar el correo de bienvenida
    return { user: user.toPublic(), temporaryPassword: plainPassword };
  }
}

module.exports = CreateUser;