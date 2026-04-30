// infrastructure/repositories/SupplyCategoryRepository.js
const CategoriaInsumoModel = require("../db/CategoriaInsumoModel");
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
    const docs = await CategoriaInsumoModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await CategoriaInsumoModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async save(data) {
    const doc = await CategoriaInsumoModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await CategoriaInsumoModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await CategoriaInsumoModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = SupplyCategoryRepository;
