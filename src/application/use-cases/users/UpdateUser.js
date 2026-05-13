// application/use-cases/users/UpdateUser.js

class UpdateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(id, data) {
    const existing = await this.userRepository.findById(id);
    if (!existing) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const { tipoDocumento, numeroDocumento, nombreCompleto, correo, rolId, sedeId } = data;

    // Unicidad de correo (excluye el usuario actual)
    if (correo && correo !== existing.correo) {
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
    if (tipoDocumento)   changes.tipoDocumento   = tipoDocumento;
    if (numeroDocumento) changes.numeroDocumento  = numeroDocumento;
    if (nombreCompleto)  changes.nombreCompleto   = nombreCompleto.trim();
    if (correo)          changes.correo           = correo;
    if (rolId)           changes.rolId            = rolId;
    if (sedeId)          changes.sedeId           = sedeId;

    const updated = await this.userRepository.update(id, changes);
    const { password, ...userPublic } = updated.toObject ? updated.toObject() : updated;
    return userPublic;
  }
}

module.exports = UpdateUser;