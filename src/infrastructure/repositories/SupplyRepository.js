// infrastructure/repositories/SupplyRepository.js
const SupplyModel = require("../db/SupplyModel");
const SupplyCategoryModel = require("../db/SupplyCategoryModel");
const Supply = require("../../domain/entities/Supply");

class SupplyRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Supply({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombre: re }, { categoria: re }];
    }
    if (filters.categoria !== undefined) query.categoria = filters.categoria;
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await SupplyModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await SupplyModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async findByName(nombre) {
    const doc = await SupplyModel.findOne({ nombre }).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await SupplyModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await SupplyModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await SupplyModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }

  async findAllCategorias() {
    return SupplyCategoryModel.find({ estado: true });
  }

  async findCategoriaById(id) {
    return SupplyCategoryModel.findOne({ _id: id, estado: true }).catch(() => null);
  }
}

module.exports = SupplyRepository;
