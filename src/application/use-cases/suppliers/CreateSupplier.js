// application/use-cases/suppliers/CreateSupplier.js
class CreateSupplier {
  constructor(supplierRepository) {
    this.supplierRepository = supplierRepository;
  }

  async execute(data) {
    const { nit, nombre_de_empresa, nombre_del_contacto, direccion, telefono, correo, sitio_web, correoContacto } = data;

    if (!nit || !nombre_de_empresa || !nombre_del_contacto || !direccion || !telefono || !correo) {
      const error = new Error("Faltan campos requeridos");
      error.statusCode = 400;
      throw error;
    }

    if (await this.supplierRepository.findByNit(nit)) {
      const error = new Error("Ya existe un proveedor con ese NIT");
      error.statusCode = 409;
      throw error;
    }

    if (await this.supplierRepository.findByEmail(correo)) {
      const error = new Error("Ya existe un proveedor con ese correo");
      error.statusCode = 409;
      throw error;
    }

    return this.supplierRepository.create({
      nit,
      nombre_de_empresa,
      nombre_del_contacto,
      direccion,
      telefono,
      correo,
      sitio_web,
      correoContacto,
      activo: true,
    });
  }
}

module.exports = CreateSupplier;
