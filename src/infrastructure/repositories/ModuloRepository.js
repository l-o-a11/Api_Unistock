// infrastructure/repositories/ModuloRepository.js
const ModuloModel = require("../db/ModuloModel");
const Modulo = require("../../domain/entities/Modulo");

class ModuloRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Modulo({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await ModuloModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findByNombre(nombre) {
    const doc = await ModuloModel.findOne({ nombre: nombre.toLowerCase() });
    return this._toEntity(doc);
  }
}

module.exports = ModuloRepository;
