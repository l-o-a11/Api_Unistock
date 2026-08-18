// application/use-cases/thirdParties/UpdateThirdParties.js

class UpdateThirdParties {
  constructor(thirdPartiesRepository) {
    this.thirdPartiesRepository = thirdPartiesRepository;
  }

  async execute(id, data) {
    const existing = await this.thirdPartiesRepository.findById(id);
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
      nit,
      correo_empresa,
    } = data;

    const changes = {};

    if (nombre !== undefined) {
      const normalizedNombre = String(nombre || "").trim().toLowerCase();
      if (!normalizedNombre) {
        const error = new Error("Nombre es requerido");
        error.statusCode = 400;
        throw error;
      }
      const byName = await this.thirdPartiesRepository.findByCompanyName(normalizedNombre, id);
      if (byName) {
        const error = new Error("Ya existe otro tercero con este nombre");
        error.statusCode = 409;
        throw error;
      }
      changes.nombre = nombre;
      changes.nombre_empresa = nombre;
    }

    if (contacto !== undefined) {
      changes.contacto = contacto;
      changes.nombre_contacto = contacto;
    }

    if (direccion !== undefined && direccion !== null && String(direccion).trim() !== "") {
      const normalizedDireccion = String(direccion).trim();
      const byDir = await this.thirdPartiesRepository.findByDireccion(normalizedDireccion, id);
      if (byDir) {
        const error = new Error("Ya existe otro tercero con esta dirección");
        error.statusCode = 409;
        throw error;
      }
      changes.direccion = direccion;
    }

    if (telefono !== undefined && telefono !== null && String(telefono).trim() !== "") {
      const normalizedTelefono = String(telefono).trim();
      const byPhone = await this.thirdPartiesRepository.findByTelefono(normalizedTelefono, id);
      if (byPhone) {
        const error = new Error("Ya existe otro tercero con este teléfono");
        error.statusCode = 409;
        throw error;
      }
      changes.telefono = telefono;
    }

    if (nit !== undefined && nit !== null && String(nit).trim() !== "") {
      const normalizedNit = String(nit).trim();
      const byNit = await this.thirdPartiesRepository.findByNit(normalizedNit, id);
      if (byNit) {
        const error = new Error("Ya existe otro tercero con este NIT");
        error.statusCode = 409;
        throw error;
      }
      changes.nit = nit;
    }

    if (correo_empresa !== undefined && correo_empresa !== null && String(correo_empresa).trim() !== "") {
      const normalizedCorreo = String(correo_empresa).trim().toLowerCase();
      const byEmail = await this.thirdPartiesRepository.findByCorreo(normalizedCorreo, id);
      if (byEmail) {
        const error = new Error("Ya existe otro tercero con este correo");
        error.statusCode = 409;
        throw error;
      }
      changes.correo_empresa = correo_empresa;
    }

    if (barrio !== undefined) changes.barrio = barrio;
    if (estado !== undefined) changes.estado = estado;

    const updated = await this.thirdPartiesRepository.update(id, changes);
    return updated;
  }
}

module.exports = UpdateThirdParties;
