const mongoose = require('mongoose');
const { sendEmailChangedEmail } = require('../../../shared/utils/emailService');

// Valida que un string sea un ObjectId válido de MongoDB.
// Evita que Mongoose lance un CastError no controlado cuando llega
// un string basura como rolId o sedeId.
const isValidId = (id) => id && mongoose.Types.ObjectId.isValid(id);

class UpdateUser {
  constructor(userRepository, roleRepository, siteRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
    this.siteRepository = siteRepository;
  }

  async execute(id, data) {
    if (!isValidId(id)) {
      const error = new Error("ID de usuario inválido");
      error.statusCode = 400;
      throw error;
    }

    const existing = await this.userRepository.findById(id);
    if (!existing) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const { tipoDocumento, numeroDocumento, nombreCompleto, correo, rolId, sedeId, cargo } = data;

    // Detectar si el correo va a cambiar (para enviar notificación después)
    const emailChanged = correo && correo !== existing.correo;

    // Unicidad de correo (excluye el usuario actual)
    if (emailChanged) {
      const byEmail = await this.userRepository.findByEmail(correo);
      if (byEmail && byEmail.id.toString() !== id.toString()) {
        const error = new Error("Ya existe otro usuario con ese correo electrónico");
        error.statusCode = 409;
        throw error;
      }
    }

    // Unicidad de documento (excluye el usuario actual)
    if (numeroDocumento && numeroDocumento !== existing.numeroDocumento) {
      const byDoc = await this.userRepository.findByDocument(numeroDocumento);
      if (byDoc && byDoc.id.toString() !== id.toString()) {
        const error = new Error("Ya existe otro usuario con ese número de documento");
        error.statusCode = 409;
        throw error;
      }
    }

    const changes = {};
    if (tipoDocumento) changes.tipoDocumento = tipoDocumento;
    if (numeroDocumento) changes.numeroDocumento = numeroDocumento;
    if (nombreCompleto) changes.nombreCompleto = nombreCompleto.trim();
    if (correo) changes.correo = correo;

    if (rolId) {
      if (!isValidId(rolId)) {
        const error = new Error("ID de rol inválido");
        error.statusCode = 422;
        throw error;
      }
      const role = await this.roleRepository.findById(rolId);
      if (!role || !role.estado) {
        const error = new Error("Rol inválido o inactivo");
        error.statusCode = 422;
        throw error;
      }
      changes.rolId = rolId;
    }

    if (sedeId) {
      if (!isValidId(sedeId)) {
        const error = new Error("ID de sede inválido");
        error.statusCode = 422;
        throw error;
      }
      const site = await this.siteRepository.findById(sedeId);
      if (!site || !site.estado) {
        const error = new Error("Sede inválida o inactiva");
        error.statusCode = 422;
        throw error;
      }
      changes.sedeId = sedeId;
    }

    // cargo puede limpiarse explícitamente a null (ej. si el rol deja de ser
    // "Empleado"), por eso se compara con undefined en vez de solo truthy.
    if (cargo !== undefined) changes.cargo = cargo || null;

    // Si no hay nada que cambiar, devolver el usuario actual sin tocar BD
    if (Object.keys(changes).length === 0) {
      return existing.toPublic ? existing.toPublic() : existing;
    }

    const updated = await this.userRepository.update(id, changes);
    // toPublic() garantiza que nunca se filtre el hash de contraseña
    const userPublic = updated.toPublic
      ? updated.toPublic()
      : (() => { const { password, ...rest } = updated.toObject ? updated.toObject() : updated; return rest; })();

    // Notificar al NUEVO correo si cambió.
    // No lanzamos si el email falla — el update ya fue exitoso.
    if (emailChanged) {
      sendEmailChangedEmail({
        nombreCompleto: userPublic.nombreCompleto ?? existing.nombreCompleto,
        correoNuevo: correo,
        correoAnterior: existing.correo,
      }).catch((err) => console.error('Error enviando correo de cambio de email:', err));
    }
    return userPublic;
  }
}

module.exports = UpdateUser;