// application/use-cases/suppliers/UpdateUser.js

class UpdateSupplier {
  constructor(supplierRepository) {
    this.supplierRepository = supplierRepository;
  }

  execute(id, data) {
    const existing = this.supplierRepository.findById(id);
    if (!existing) {
      const error = new Error("Proveedor no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const {
     nit,
      nombre_de_empresa,
      nombre_del_contacto,
      direccion,
      telefono,
      correo,
      sitio_web,
      correoContacto,
      activo,
    }

    // Unicidad de correo (excluye el proveedor actual)
    if (correo && correo !== existing.correo) {
      const byEmail = this.supplierRepository.findByEmail(correo);
      if (byEmail && byEmail.id !== parseInt(id)) {
        const error = new Error(
          "Ya existe otro proveedor con ese correo electrónico",
        );
        error.statusCode = 409;
        throw error;
      }
    }

    // Unicidad de documento (excluye el proveedor actual)
    if (numeroDocumento && numeroDocumento !== existing.numeroDocumento) {
      const byDoc = this.supplierRepository.findByDocument(numeroDocumento);
      if (byDoc && byDoc.id !== parseInt(id)) {
        const error = new Error(
          "Ya existe otro proveedor con ese número de documento",
        );
        error.statusCode = 409;
        throw error;
      }
    }

    if (rolId && !this.Repository.findRoleById(rolId)) {
      const error = new Error("El rol seleccionado no existe");
      error.statusCode = 422;
      throw error;
    }

    if (sedeId && !this.supplierRepository.findSedeById(sedeId)) {
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

    const updated = this.supplierRepository.update(id, changes);
    return updated.toPublic();
  }
}