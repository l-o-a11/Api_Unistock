// infrastructure/repositories/UserRepository.js
const UserModel = require("../db/UserModel");
const User = require("../../domain/entities/User");

class UserRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new User({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombreCompleto: re }, { correo: re }, { numeroDocumento: re }];
    }
    if (filters.rolId  !== undefined) query.rolId  = parseInt(filters.rolId);
    if (filters.sedeId !== undefined) query.sedeId = parseInt(filters.sedeId);
    if (filters.estado !== undefined) query.estado = filters.estado === "true" || filters.estado === true;
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

  async countActiveAdmins() {
    return UserModel.countDocuments({ rolId: 2, estado: true });
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

  // Catálogos (sin modelo propio — arrays estáticos por ahora)
  findAllRoles()     { return []; }
  findRoleById(id)   { return id ? { id: parseInt(id) } : null; }
  findAllSedes()     { return []; }
  findSedeById(id)   { return id ? { id: parseInt(id) } : null; }
}

module.exports = UserRepository;
