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
    const docs = await ModuleModel.find(query).sort({ nombre: 1 });
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await ModuleModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async findByNombre(nombre) {
    const doc = await ModuleModel.findOne({ nombre: nombre.trim().toLowerCase() }).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await ModuleModel.create({
      nombre: data.nombre.trim().toLowerCase(),
      estado: data.estado !== undefined ? data.estado : true,
    });
    return this._toEntity(doc);
  }

  async update(id, changes) {
    if (changes.nombre) changes.nombre = changes.nombre.trim().toLowerCase();
    const doc = await ModuleModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await ModuleModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = ModuleRepository;

