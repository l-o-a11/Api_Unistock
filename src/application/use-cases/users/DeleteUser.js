class DeleteUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
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
      const error = new Error("No se puede eliminar el único administrador activo del sistema");
      error.statusCode = 422;
      throw error;
    }

    await this.userRepository.delete(id);
    return true;
  }
}

module.exports = DeleteUser;