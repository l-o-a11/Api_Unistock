// application/use-cases/users/GetUser.js
// Caso de uso: listar usuarios con filtros opcionales

class GetUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  execute(filters = {}) {
    const users = this.userRepository.findAll(filters);
    return users.map((u) => u.toPublic());
  }
}

module.exports = GetUser;