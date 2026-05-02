const { hash } = require("../../../infrastructure/security/password_encrypter");
const { sendWelcomeEmail } = require("../../../shared/utils/emailService");
const { generatePassword } = require("../../../shared/utils/generatePassword");

class CreateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(data, createdBy) {
    const {
      tipoDocumento, numeroDocumento, nombreCompleto,
      correo, rolId, sedeId,
    } = data;

    // Si es Admin solo puede crear usuarios de su propia sede
    if (createdBy.rolId !== "gerente" && 
        createdBy.sedeId.toString() !== sedeId.toString()) {
      const error = new Error("Solo puedes crear usuarios de tu sede");
      error.statusCode = 403;
      throw error;
    }

    if (await this.userRepository.findByEmail(correo)) {
      const error = new Error("Ya existe un usuario con ese correo");
      error.statusCode = 409;
      throw error;
    }

    if (await this.userRepository.findByDocument(numeroDocumento)) {
      const error = new Error("Ya existe un usuario con ese número de documento");
      error.statusCode = 409;
      throw error;
    }

    const plainPassword = data.password?.trim() || generatePassword();
    const hashedPassword = await hash(plainPassword);

    const user = await this.userRepository.save({
      tipoDocumento,
      numeroDocumento,
      nombreCompleto: nombreCompleto.trim(),
      correo,
      password: hashedPassword,
      rolId,
      sedeId,
      estado: true,
    });

    // Enviar correo de bienvenida con la contraseña en texto plano
    await sendWelcomeEmail({
      nombreCompleto,
      correo,
      password: plainPassword,
    });

    return user.toPublic();
  }
}

module.exports = CreateUser;