const UserModel = require("../db/UserModel");
const User = require("../../domain/entities/User");

class UserRepository {

  // ── Conversión doc → entidad ───────────────────────────────────────────────
  // Usa .toObject() para obtener el POJO limpio del documento Mongoose.
  // IMPORTANTE: .toObject() NO dispara toJSON(), así que el password llega íntegro.
  // Nunca pasar un doc ya serializado (res.json lo llama implícitamente).
  //
  // rolNombre: si el doc viene de una query con .populate("rolId"), el campo
  // rolId es un objeto { _id, nombre }. Lo extraemos aquí para que la entidad
  // tenga acceso al nombre del rol sin necesidad de hacer un lookup extra.
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;

    // Extraer rolNombre si rolId fue populado; si no, queda null
    let rolNombre = null;
    let rolId = obj.rolId;
    if (obj.rolId && typeof obj.rolId === "object" && obj.rolId.nombre) {
      rolNombre = obj.rolId.nombre;
      rolId = obj.rolId._id?.toString() ?? null;
    }

    return new User({
      ...obj,
      id: obj._id ? obj._id.toString() : obj.id,
      rolId,
      rolNombre,
    });
  }

  // ── Lectura ────────────────────────────────────────────────────────────────

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombreCompleto: re }, { correo: re }, { numeroDocumento: re }];
    }
    if (filters.rolId) query.rolId = filters.rolId;
    if (filters.sedeId) query.sedeId = filters.sedeId;
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }

    // Excluir roles por nombre (ej. vista "empleados": todo rol que no sea
    // Gerente/Administrador). Recibe un array o string separado por comas.
    if (filters.excludeRoleNames) {
      const nombres = Array.isArray(filters.excludeRoleNames)
        ? filters.excludeRoleNames
        : String(filters.excludeRoleNames).split(",").map((n) => n.trim()).filter(Boolean);

      if (nombres.length) {
        const RoleModel = require("../db/RoleModel");
        const rolesAExcluir = await RoleModel.find({ nombre: { $in: nombres } })
          .select("_id")
          .lean();
        const idsAExcluir = rolesAExcluir.map((r) => r._id);

        if (idsAExcluir.length) {
          // Si ya había un filtro de rolId puntual, combinamos con $and
          // para no pisarlo accidentalmente.
          if (query.rolId) {
            query.$and = [{ rolId: query.rolId }, { rolId: { $nin: idsAExcluir } }];
            delete query.rolId;
          } else {
            query.rolId = { $nin: idsAExcluir };
          }
        }
      }
    }

    const docs = await UserModel.find(query).populate("rolId", "nombre");
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await UserModel.findById(id).populate("rolId", "nombre").catch(() => null);
    return this._toEntity(doc);
  }

  async findByEmail(correo) {
    const doc = await UserModel.findOne({ correo }).populate("rolId", "nombre").catch(() => null);
    return this._toEntity(doc);
  }

  /**
   * Igual que findByEmail pero garantiza que el campo `password` esté presente.
   * Usar EXCLUSIVAMENTE en LoginUser para comparar el hash. Ver findByIdWithPassword.
   */
  async findByEmailWithPassword(correo) {
    const obj = await UserModel
      .findOne({ correo })
      .select("+password")
      .lean()
      .catch(() => null);

    if (!obj) return null;

    // lean() no soporta populate, así que resolvemos rolNombre aparte
    const RoleModel = require("../db/RoleModel");
    const rol = obj.rolId
      ? await RoleModel.findById(obj.rolId).lean().catch(() => null)
      : null;

    return new User({ ...obj, id: obj._id.toString(), rolNombre: rol?.nombre ?? null });
  }

  async findByDocument(numeroDocumento) {
    const doc = await UserModel.findOne({ numeroDocumento }).catch(() => null);
    return this._toEntity(doc);
  }

  /**
   * Igual que findById pero garantiza que el campo `password` (hash bcrypt)
   * esté presente en la entidad devuelta.
   *
   * Usar EXCLUSIVAMENTE en use cases de autenticación que necesitan comparar
   * contraseñas (LoginUser, ChangePassword). Nunca exponer la entidad devuelta
   * directamente al cliente — siempre llamar a toPublic() antes de responder.
   *
   * Usamos .select("+password") por si en el futuro el campo se marca con
   * `select: false` en el schema, y .lean() para obtener el POJO directamente
   * sin pasar por toJSON(), que elimina el password.
   */
  async findByIdWithPassword(id) {
    const obj = await UserModel
      .findById(id)
      .select("+password")
      .lean()                // devuelve POJO, no documento Mongoose → no dispara toJSON()
      .catch(() => null);

    if (!obj) return null;

    // lean() no soporta populate, así que resolvemos rolNombre aparte
    const RoleModel = require("../db/RoleModel");
    const rol = obj.rolId
      ? await RoleModel.findById(obj.rolId).lean().catch(() => null)
      : null;

    return new User({ ...obj, id: obj._id.toString(), rolNombre: rol?.nombre ?? null });
  }

  // ── Escritura ──────────────────────────────────────────────────────────────

  async save(data) {
    const doc = await UserModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    // Capturar errores de validación/casteo de Mongo para que el controlador
    // pueda responder con un 400 informativo en lugar de un 500 genérico.
    let doc;
    try {
      doc = await UserModel.findByIdAndUpdate(
        id,
        changes,
        { new: true, runValidators: true },
      );
    } catch (err) {
      // Relanzar con un mensaje descriptivo según el tipo de error
      if (err.name === "ValidationError") {
        const validationErr = new Error(err.message);
        validationErr.name = "ValidationError";
        validationErr.statusCode = 422;
        throw validationErr;
      }
      if (err.name === "CastError") {
        const castErr = new Error("ID de usuario inválido");
        castErr.name = "CastError";
        castErr.statusCode = 400;
        throw castErr;
      }
      throw err;
    }
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await UserModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }

  // ── Conteo — usado por la regla de último admin activo ────────────────────
  // Busca el rol "Administrador" por nombre y cuenta los usuarios activos con ese rol.
  // Si el rol no existe en BD, devuelve 0 (seguro: nunca bloquea una eliminación
  // por un rol inexistente).
  async countActiveAdmins() {
    const RoleModel = require("../db/RoleModel");
    const rol = await RoleModel.findOne({ nombre: "Administrador" }).lean().catch(() => null);
    if (!rol) return 0;
    return UserModel.countDocuments({ estado: true, rolId: rol._id });
  }

  async hasActiveProductions(userId) {
    const ProductionOrderModel = require("../db/ProductionOrderModel");
    const count = await ProductionOrderModel.countDocuments({
      empleadoAsignadoId: userId,
      estado: { $nin: ["Anulada", "Enviado"] },
    });
    return count > 0;
  }

  // ── Intentos fallidos de login ──────────────────────────────────────────
  // Incrementa el contador y devuelve el valor YA actualizado (atómico via
  // $inc + findOneAndUpdate, evita condiciones de carrera si llegaran dos
  // intentos fallidos casi simultáneos).
  async incrementFailedAttempts(id) {
    const doc = await UserModel.findByIdAndUpdate(
      id,
      { $inc: { intentosFallidos: 1 } },
      { new: true },
    ).catch(() => null);
    return doc?.intentosFallidos ?? 0;
  }

  async resetFailedAttempts(id) {
    await UserModel.findByIdAndUpdate(id, { intentosFallidos: 0 }).catch(() => null);
  }

  // ── Usuarios activos con un rol puntual — usado para notificar a Gerentes
  // cuando se bloquea una cuenta por intentos fallidos ─────────────────────
  async findActiveByRoleId(rolId) {
    const docs = await UserModel.find({ rolId, estado: true }).catch(() => []);
    return docs.map((d) => this._toEntity(d));
  }

  // ── Stubs heredados — se mantienen por compatibilidad con CreateUser/UpdateUser
  findAllRoles() { return []; }
  findRoleById(id) { return id ? { id } : null; }
  findAllSedes() { return []; }
  findSedeById(id) { return id ? { id } : null; }
}

module.exports = UserRepository;