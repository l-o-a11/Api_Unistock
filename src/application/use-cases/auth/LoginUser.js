// application/use-cases/auth/LoginUser.js

const { compare } = require("../../../infrastructure/security/password_encrypter");
const { generate } = require("../../../infrastructure/security/token_generator");

class LoginUser {
  // ── El use case recibe los dos repositorios que necesita ──────────────────
  // userRepository → buscar el usuario y su hash de contraseña
  // roleRepository → verificar que el rol existe y está activo
  constructor(userRepository, roleRepository) {
    this.userRepository = userRepository;
    this.roleRepository = roleRepository;
  }

  async execute({ correo, password }) {

    // 1. Buscar usuario incluyendo el password hash para poder compararlo.
    //    Se usa findByIdWithPassword-equivalente: findByEmailWithPassword.
    //    findByEmail() en principio también incluye el password porque _toEntity
    //    usa .toObject() (no .toJSON()), pero usamos findByEmailWithPassword()
    //    para hacerlo explícito e irrompible ante futuros cambios del schema.
    const user = await this.userRepository.findByEmailWithPassword(correo);

    // Respuesta genérica — no revelar si el correo existe o no
    if (!user) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    // FIX: caso pedido explícitamente por negocio — un usuario desactivado
    // que intenta entrar debe ver un mensaje claro, no el genérico de
    // "credenciales inválidas". Nota: esto sacrifica un poco de protección
    // anti-enumeración (confirma que el correo existe y está inactivo),
    // pero en un sistema interno sin registro público ese riesgo es bajo
    // comparado con la confusión de un usuario que no entiende por qué
    // no puede entrar.
    if (!user.estado) {
      const error = new Error("Tu usuario está desactivado. Por favor comunícate con un administrador o gerente.");
      error.statusCode = 403;
      throw error;
    }

    // 2. Verificar contraseña
    const match = await compare(password, user.password);
    if (!match) {
      const error = new Error("Credenciales inválidas");
      error.statusCode = 401;
      throw error;
    }

    // 3. Verificar que el rol existe y está activo — a través del repositorio,
    //    no importando RoleModel directamente.
    const rol = await this.roleRepository.findById(user.rolId);

    if (!rol || !rol.nombre || !rol.estado) {
      const error = new Error("El rol del usuario no existe o está inactivo");
      error.statusCode = 403;
      throw error;
    }

    // 4. Generar token
    const token = generate({
      id: user.id,
      correo: user.correo,
      rolId: user.rolId,
      sedeId: user.sedeId,
      rolNombre: rol.nombre,
      nombreCompleto: user.nombreCompleto,
    });

    // 5. Devolver token + usuario sin password.
    //    Se usa toPublic() de la entidad User — nunca spread directo,
    //    porque la entidad tiene el campo password en memoria.
    return { token, user: user.toPublic() };
  }
}

module.exports = LoginUser;