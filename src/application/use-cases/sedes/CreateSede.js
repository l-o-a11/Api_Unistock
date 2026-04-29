// application/use-cases/sedes/CreateSede.js

class CreateSede {
  constructor(sedeRepository) {
    this.sedeRepository = sedeRepository;
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
    if (this.sedeRepository.findAll().some(s => s.nombre.toLowerCase() === nombre.toLowerCase())) {
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

    return this.sedeRepository.save({
      nombre,
      ciudad,
      barrio,
      direccion,
      telefono,
      estado: true,
    });
  }
}

module.exports = CreateSede;