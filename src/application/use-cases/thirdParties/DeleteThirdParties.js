// application/use-cases/thirdPartiess/DeleteUser.js

class DeleteUser {
  constructor(thirdPartiesRepository) {
    this.thirdPartiesRepository = thirdPartiesRepository;
  }

  execute(id) {
    const thirdParties = this.thirdPartiesRepository.findById(id);
    if (!thirdParties) {
      const error = new Error("Tercero no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // Protección: no eliminar al único administrador activo
    if (thirdParties.isLastActiveAdmin(this.thirdPartiesRepository.countActiveAdmins())) {
      const error = new Error(
        "No se puede eliminar el único administrador activo del sistema",
      );
      error.statusCode = 422;
      throw error;
    }

    this.thirdPartiesRepository.delete(id);
    return true;
  }
}