// application/use-cases/thirdParties/ToggleThirdParty.js

class ToggleThirdParty {
  constructor(thirdPartiesRepository) {
    this.thirdPartiesRepository = thirdPartiesRepository;
  }

  async execute(id) {
    const thirdParties = await this.thirdPartiesRepository.findById(id);
    if (!thirdParties) {
      const error = new Error("Tercero no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const tieneActiva = await this.thirdPartiesRepository.tieneProduccionActiva(id);
    if (tieneActiva) {
      const error = new Error(
        "No se puede cambiar el estado del tercero porque tiene producciones activas asignadas",
      );
      error.statusCode = 422;
      throw error;
    }

    const updated = await this.thirdPartiesRepository.toggleEstado(id);
    if (!updated) {
      const error = new Error("No se pudo cambiar el estado del tercero");
      error.statusCode = 500;
      throw error;
    }

    return updated;
  }
}

module.exports = ToggleThirdParty;
