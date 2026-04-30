// infrastructure/repositories/PrivilegioRepository.js
const PrivilegioModel = require("../db/PrivilegioModel");
const Privilegio = require("../../domain/entities/Privilegio");

class PrivilegioRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Privilegio({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await PrivilegioModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findByNombre(nombre) {
    const doc = await PrivilegioModel.findOne({ nombre: nombre.toLowerCase() });
    return this._toEntity(doc);
  }
}

module.exports = PrivilegioRepository;
