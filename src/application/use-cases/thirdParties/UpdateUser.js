// application/use-cases/users/UpdateUser.js

class UpdateUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  execute(id, data) {
    const existing = this.userRepository.findById(id);
    if (!existing) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const {
      tipoDocumento,
      numeroDocumento,
      nombreCompleto,
      correo,
      rolId,
      sedeId,
    } = data;

    // Unicidad de correo (excluye el usuario actual)
    if (correo && correo !== existing.correo) {
      const byEmail = this.userRepository.findByEmail(correo);
      if (byEmail && byEmail.id !== parseInt(id)) {
        const error = new Error(
          "Ya existe otro usuario con ese correo electrónico",
        );
        error.statusCode = 409;
        throw error;
      }
    }

    // Unicidad de documento (excluye el usuario actual)
    if (numeroDocumento && numeroDocumento !== existing.numeroDocumento) {
      const byDoc = this.userRepository.findByDocument(numeroDocumento);
      if (byDoc && byDoc.id !== parseInt(id)) {
        const error = new Error(
          "Ya existe otro usuario con ese número de documento",
        );
        error.statusCode = 409;
        throw error;
      }
    }

    if (rolId && !this.userRepository.findRoleById(rolId)) {
      const error = new Error("El rol seleccionado no existe");
      error.statusCode = 422;
      throw error;
    }

    if (sedeId && !this.userRepository.findSedeById(sedeId)) {
      const error = new Error("La sede seleccionada no existe");
      error.statusCode = 422;
      throw error;
    }

    const changes = {};
    if (tipoDocumento) changes.tipoDocumento = tipoDocumento;
    if (numeroDocumento) changes.numeroDocumento = numeroDocumento;
    if (nombreCompleto) changes.nombreCompleto = nombreCompleto.trim();
    if (correo) changes.correo = correo;
    if (rolId) changes.rolId = parseInt(rolId);
    if (sedeId) changes.sedeId = parseInt(sedeId);

    const updated = this.userRepository.update(id, changes);
    return updated.toPublic();
  }
}