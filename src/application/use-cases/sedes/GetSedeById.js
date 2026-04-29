// application/use-cases/sedes/GetSedeById.js

class GetSedeById {
  constructor(sedeRepository) {
    this.sedeRepository = sedeRepository;
  }

  execute(id) {
    const sede = this.sedeRepository.findById(id);
    if (!sede) {
      const error = new Error("Sede no encontrada");
      error.statusCode = 404;
      throw error;
    }
    return sede;
  }
}

module.exports = GetSedeById;