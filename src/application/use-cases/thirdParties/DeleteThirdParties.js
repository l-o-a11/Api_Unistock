// application/use-cases/thirdParties/DeleteThirdParties.js

class DeleteThirdParties {
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
         "No se puede eliminar el tercero porque tiene producciones activas asignadas",
      );
      error.statusCode = 422;
      throw error;
    }
     await this.thirdPartiesRepository.delete(id);
    return true;
  }
  }

module.exports = DeleteThirdParties;
