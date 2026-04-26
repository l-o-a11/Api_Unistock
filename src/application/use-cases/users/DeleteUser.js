// application/use-cases/users/DeleteUser.js

class DeleteUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  execute(id) {
    const user = this.userRepository.findById(id);
    if (!user) {
      const error = new Error("Usuario no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // Protección: no eliminar al único administrador activo
    if (user.isLastActiveAdmin(this.userRepository.countActiveAdmins())) {
      const error = new Error(
        "No se puede eliminar el único administrador activo del sistema",
      );
      error.statusCode = 422;
      throw error;
    }

    this.userRepository.delete(id);
    return true;
  }
}

module.exports = DeleteUser;