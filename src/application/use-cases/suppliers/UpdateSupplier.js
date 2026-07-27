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
      tipo_documento,
      direccion,
      telefono,
      correo,
      sitio_web,
      correoContacto,
      telefonoContacto,
      tipoDocumentoContacto,
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

    const changes = {};
    if (tipo_documento !== undefined) changes.tipo_documento = tipo_documento;
    if (tipoDocumentoContacto !== undefined) changes.tipo_documento_contacto = tipoDocumentoContacto;
    if (telefonoContacto !== undefined) changes.telefono_contacto = telefonoContacto;

    const updated = this.supplierRepository.update(id, changes);
    return updated.toPublic();
  }
}