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
    const doc = await UserModel
      .findByIdAndUpdate(id, changes, { new: true })
      .catch(() => null);
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

  // ── Stubs heredados — se mantienen por compatibilidad con CreateUser/UpdateUser
  findAllRoles() { return []; }
  findRoleById(id) { return id ? { id } : null; }
  findAllSedes() { return []; }
  findSedeById(id) { return id ? { id } : null; }
}

module.exports = UserRepository;