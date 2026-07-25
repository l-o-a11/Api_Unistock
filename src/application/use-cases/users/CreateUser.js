const { hash } = require("../../../infrastructure/security/password_encrypter");
const { sendWelcomeEmail } = require("../../../shared/utils/emailService");
const { generatePassword } = require("../../../shared/utils/generatePassword");

class CreateUser {
  constructor(userRepository, roleRepository, siteRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.siteRepository = siteRepository;
  }

  async execute(data, createdBy) {
    const {
      tipoDocumento, numeroDocumento, nombreCompleto,
      correo, rolId, sedeId, cargo,
    } = data;

    if (createdBy.rolNombre?.toLowerCase() !== "gerente" &&
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

    const role = await this.roleRepository.findById(rolId);
    if (!role || !role.estado) {
      const error = new Error("Rol inválido o inactivo");
      error.statusCode = 422;
      throw error;
    }

    const site = await this.siteRepository.findById(sedeId);
    if (!site || !site.estado) {
      const error = new Error("Sede inválida o inactiva");
      error.statusCode = 422;
      throw error;
    }

    const plainPassword = generatePassword();
    const hashedPassword = await hash(plainPassword);

    const user = await this.userRepository.save({
      tipoDocumento,
      numeroDocumento,
      nombreCompleto: nombreCompleto.trim(),
      correo,
      password: hashedPassword,
      rolId,
      sedeId,
      cargo: cargo || null,
      estado: true,
    });

    try {
      await sendWelcomeEmail({
        nombreCompleto,
        correo,
        password: plainPassword,
      });
    } catch (emailError) {
      console.warn("Correo no enviado:", emailError.message);
    }

    const userObj = user.toObject ? user.toObject() : user;
    const { password: _, ...userPublic } = userObj;
    return userPublic;
  }
}

module.exports = CreateUser;