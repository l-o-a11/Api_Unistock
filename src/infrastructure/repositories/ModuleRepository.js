// infrastructure/repositories/ModuleRepository.js
const ModuleModel = require("../db/ModuleModel");
const Module = require("../../domain/entities/Module");

class ModuleRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Module({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await ModuleModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findByNombre(nombre) {
    const doc = await ModuleModel.findOne({ nombre: nombre.toLowerCase() });
    return this._toEntity(doc);
  }
}

module.exports = ModuleRepository;
