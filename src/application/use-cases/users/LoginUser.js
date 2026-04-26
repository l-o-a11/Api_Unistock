// application/use-cases/users/LoginUser.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

class LoginUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ correo, password }) {
    const user = this.userRepository.findByEmail(correo);

    if (!user || !user.estado) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign(
      {
        id: user.id,
        correo: user.correo,
        rolId: user.rolId,
        nombreCompleto: user.nombreCompleto,
      },
      process.env.JWT_SECRET || "unistock_secret",
      { expiresIn: "8h" },
    );

    return { token, user: user.toPublic() };
  }
}