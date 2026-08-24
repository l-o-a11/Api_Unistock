class DeleteUser {
  // FIX: recibe también productionRepository para verificar que el usuario
  // no tenga producción activa asignada antes de dejarlo eliminar.
  constructor(userRepository, productionRepository) {
    this.userRepository = userRepository;
    this.productionRepository = productionRepository;
  }

  async execute(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    const activeAdmins = await this.userRepository.countActiveAdmins();
    if (user.isLastActiveAdmin(activeAdmins)) {
      const error = new Error(
        "No se puede eliminar el único administrador activo del sistema",
      );
      error.statusCode = 422;
      throw error;
    }

    // FIX (punto 3): no eliminar a un empleado con producción activa asignada.
    // Se comprueba por id de usuario, sin importar el rol textual, porque
    // empleadoAsignadoId puede apuntar a cualquier usuario.
    if (this.productionRepository) {
      const activeAssignments =
        await this.productionRepository.countActiveByEmployee(id);
      if (activeAssignments > 0) {
        const error = new Error(
          `No se puede eliminar: tiene ${activeAssignments} orden(es) de producción activa(s) asignada(s).`,
        );
        error.statusCode = 422;
        throw error;
      }
    }

    await this.userRepository.delete(id);
    return true;
  }
}

module.exports = DeleteUser;
