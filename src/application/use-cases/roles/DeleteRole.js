// application/use-cases/roles/DeleteRole.js

class DeleteRole {
  constructor(roleRepository, userRepository) {
    this.roleRepository = roleRepository;
    this.userRepository = userRepository;
  }

  async execute(id) {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      const error = new Error("Rol no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // Verificar si hay usuarios activos asignados a este rol
    const usersWithRole = await this.userRepository.findAll({ rolId: id, estado: true });
    if (usersWithRole.length > 0) {
      const error = new Error("No se puede eliminar el rol porque hay usuarios activos asignados");
      error.statusCode = 422;
      throw error;
    }
    await this.roleRepository.delete(id);
    return { deleted: true, id };
  }
}

module.exports = DeleteRole;
