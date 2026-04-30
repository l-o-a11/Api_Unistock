// application/use-cases/sites/CreateSite.js

class CreateSite {
  constructor(siteRepository) {
    this.siteRepository = siteRepository;
  }

  async execute(data) {
    const {
      nombre,
      ciudad,
      barrio,
      direccion,
      telefono,
    } = data;

    // Unicidad de nombre
    if (this.siteRepository.findAll().some(s => s.nombre.toLowerCase() === nombre.toLowerCase())) {
      const error = new Error("Ya existe una sede con ese nombre");
      error.statusCode = 409;
      throw error;
    }

    // Validaciones básicas
    if (!nombre || !ciudad || !barrio || !direccion || !telefono) {
      const error = new Error("Todos los campos son requeridos");
      error.statusCode = 422;
      throw error;
    }

    return this.siteRepository.save({
      nombre,
      ciudad,
      barrio,
      direccion,
      telefono,
      estado: true,
    });
  }
}

module.exports = CreateSite;