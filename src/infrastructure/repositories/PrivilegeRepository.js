// infrastructure/repositories/PrivilegeRepository.js

const PrivilegeModel = require("../db/PrivilegeModel");
const Privilege = require("../../domain/entities/Privilege");

class PrivilegeRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Privilege({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await PrivilegeModel.find(query).sort({ nombre: 1 });
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await PrivilegeModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async findByNombre(nombre) {
    const doc = await PrivilegeModel.findOne({ nombre: nombre.trim().toLowerCase() }).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await PrivilegeModel.create({
      nombre: data.nombre.trim().toLowerCase(),
      estado: data.estado !== undefined ? data.estado : true,
    });
    return this._toEntity(doc);
  }

  async update(id, changes) {
    if (changes.nombre) changes.nombre = changes.nombre.trim().toLowerCase();
    const doc = await PrivilegeModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await PrivilegeModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = PrivilegeRepository;
