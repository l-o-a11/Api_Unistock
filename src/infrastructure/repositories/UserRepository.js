const UserModel = require("../db/UserModel");
const User = require("../../domain/entities/User");

class UserRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new User({ ...obj, id: obj._id ? obj._id.toString() : obj.id });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombreCompleto: re }, { correo: re }, { numeroDocumento: re }];
    }
    if (filters.rolId)  query.rolId  = filters.rolId;
    if (filters.sedeId) query.sedeId = filters.sedeId;
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await UserModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await UserModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async findByEmail(correo) {
    const doc = await UserModel.findOne({ correo });
    return this._toEntity(doc);
  }

  async findByDocument(numeroDocumento) {
    const doc = await UserModel.findOne({ numeroDocumento });
    return this._toEntity(doc);
  }

  // TODO: usar el ObjectId real del rol Administrador cuando roles esté en dev
  async countActiveAdmins() {
    return UserModel.countDocuments({ estado: true });
  }

  async save(data) {
    const doc = await UserModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await UserModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await UserModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }

  findAllRoles()   { return []; }
  findRoleById(id) { return id ? { id } : null; }
  findAllSedes()   { return []; }
  findSedeById(id) { return id ? { id } : null; }
}

module.exports = UserRepository;