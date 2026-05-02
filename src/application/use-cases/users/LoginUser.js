const { compare } = require("../../../infrastructure/security/password_encrypter");
const { generate } = require("../../../infrastructure/security/token_generator");
const UserRepository = require("../../../infrastructure/repositories/UserRepository");

class LoginUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ correo, password }) {
    const user = await this.userRepository.findByEmail(correo);

    if (!user || !user.estado) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    const match = await compare(password, user.password);
    if (!match) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    const token = generate({
      id:             user.id,
      correo:         user.correo,
      rolId:          user.rolId,
      sedeId:         user.sedeId,
      nombreCompleto: user.nombreCompleto,
    });

    return { token, user: user.toPublic() };
  }
}

module.exports = LoginUser;