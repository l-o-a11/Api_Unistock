// application/use-cases/thirdPartiess/UpdateUser.js

class UpdateUser {
  constructor(thirdPartiesRepository) {
    this.thirdPartiesRepository = thirdPartiesRepository;
  }

  execute(id, data) {
    const existing = this.thirdPartiesRepository.findById(id);
    if (!existing) {
      const error = new Error("Tercero no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const {
     nombre,
      contacto,
      barrio,
      direccion,
      telefono,
      estado,
    }

    // Unicidad de correo (excluye el tercero actual)
    if (correo && correo !== existing.correo) {
      const byEmail = this.thirdPartiesRepository.findByEmail(correo);
      if (byEmail && byEmail.id !== parseInt(id)) {
        const error = new Error(
          "Ya existe otro tercero con ese correo electrónico",
        );
        error.statusCode = 409;
        throw error;
      }
    }

    // Unicidad de documento (excluye el tercero actual)
    if (numeroDocumento && numeroDocumento !== existing.numeroDocumento) {
      const byDoc = this.thirdPartiesRepository.findByDocument(numeroDocumento);
      if (byDoc && byDoc.id !== parseInt(id)) {
        const error = new Error(
          "Ya existe otro tercero con ese número de documento",
        );
        error.statusCode = 409;
        throw error;
      }
    }

    if (rolId && !this.thirdPartiesRepository.findRoleById(rolId)) {
      const error = new Error("El rol seleccionado no existe");
      error.statusCode = 422;
      throw error;
    }

    if (sedeId && !this.thirdPartiesRepository.findSedeById(sedeId)) {
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

    const updated = this.thirdPartiesRepository.update(id, changes);
    return updated.toPublic();
  }
}