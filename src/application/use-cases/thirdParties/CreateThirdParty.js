// application/use-cases/thirdParties/CreateThirdParty.js
class CreateThirdParty {
  constructor(thirdPartiesRepository) {
    this.thirdPartiesRepository = thirdPartiesRepository;
  }

  async execute(data) {
    const { nombre, contacto, barrio, direccion, telefono } = data;

    if (!nombre || !contacto || !direccion || !telefono) {
      const error = new Error("Faltan campos requeridos");
      error.statusCode = 400;
      throw error;
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
