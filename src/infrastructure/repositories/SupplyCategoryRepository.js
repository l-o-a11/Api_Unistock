// infrastructure/repositories/SupplyCategoryRepository.js
const SupplyCategoryModel = require("../db/SupplyCategoryModel");
const SupplyCategory = require("../../domain/entities/CategoriaInsumo");

class SupplyCategoryRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new SupplyCategory({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombre: re }, { descripcion: re }];
    }
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await SupplyCategoryModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await SupplyCategoryModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async save(data) {
    const doc = await SupplyCategoryModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await SupplyCategoryModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await SupplyCategoryModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = SupplyCategoryRepository;
