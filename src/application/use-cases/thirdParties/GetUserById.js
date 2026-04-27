// application/use-cases/users/GetUserById.js

class GetUserById {
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

    return user.toPublic();
  }
}