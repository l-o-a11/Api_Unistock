const { compare } = require("../../../infrastructure/security/password_encrypter");
const { generate } = require("../../../infrastructure/security/token_generator");
const RoleModel = require("../../../infrastructure/db/RoleModel");

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

    const rol = await RoleModel.findById(user.rolId);
    const rolNombre = rol ? rol.nombre : null;

    if (!rol || !rolNombre || !rol.estado) {
      const error = new Error("El rol del usuario no existe o está inactivo");
      error.statusCode = 403;
      throw error;
    }

    const token = generate({
      id:             user.id,
      correo:         user.correo,
      rolId:          user.rolId,
      sedeId:         user.sedeId,
      rolNombre:      rolNombre,
      nombreCompleto: user.nombreCompleto,
    });

    const { password: _, ...userPublic } = user.toObject ? user.toObject() : user;
    return { token, user: userPublic };
  }
}

module.exports = LoginUser;