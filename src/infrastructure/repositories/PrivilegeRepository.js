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
    const docs = await PrivilegeModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findByNombre(nombre) {
    const doc = await PrivilegeModel.findOne({ nombre: nombre.toLowerCase() });
    return this._toEntity(doc);
  }
}

module.exports = PrivilegeRepository;
