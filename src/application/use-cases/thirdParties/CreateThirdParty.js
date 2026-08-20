// application/use-cases/thirdParties/CreateThirdParty.js
class CreateThirdParty {
  constructor(thirdPartiesRepository) {
    this.thirdPartiesRepository = thirdPartiesRepository;
  }

  async execute(data) {
    const { nombre, contacto, barrio, direccion, telefono, nit, correo_empresa } = data;

    if (!nombre || !contacto || !direccion || !telefono) {
      const error = new Error("Faltan campos requeridos");
      error.statusCode = 400;
      throw error;
    }

    const normalizedNombre = String(nombre || "").trim().toLowerCase();
    if (normalizedNombre) {
      const byName = await this.thirdPartiesRepository.findByCompanyName(normalizedNombre);
      if (byName) {
        const error = new Error("Ya existe un tercero con este nombre");
        error.statusCode = 409;
        throw error;
      }
    }

    const normalizedDireccion = String(direccion || "").trim();
    if (normalizedDireccion) {
      const byDir = await this.thirdPartiesRepository.findByDireccion(normalizedDireccion);
      if (byDir) {
        const error = new Error("Ya existe un tercero con esta dirección");
        error.statusCode = 409;
        throw error;
      }
    }

    const normalizedTelefono = String(telefono || "").trim();
    if (normalizedTelefono) {
      const byPhone = await this.thirdPartiesRepository.findByTelefono(normalizedTelefono);
      if (byPhone) {
        const error = new Error("Ya existe un tercero con este teléfono");
        error.statusCode = 409;
        throw error;
      }
    }

    const normalizedNit = String(nit || "").trim();
    if (normalizedNit) {
      const byNit = await this.thirdPartiesRepository.findByNit(normalizedNit);
      if (byNit) {
        const error = new Error("Ya existe un tercero con este NIT");
        error.statusCode = 409;
        throw error;
      }
    }

    const normalizedCorreo = String(correo_empresa || "").trim().toLowerCase();
    if (normalizedCorreo) {
      const byEmail = await this.thirdPartiesRepository.findByCorreo(normalizedCorreo);
      if (byEmail) {
        const error = new Error("Ya existe un tercero con este correo");
        error.statusCode = 409;
        throw error;
      }
    }

    return this.thirdPartiesRepository.create({
      nombre,
      contacto,
      barrio,
      direccion,
      telefono,
      estado: true,
    });
  }
}

module.exports = CreateThirdParty;
