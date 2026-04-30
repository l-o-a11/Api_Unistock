// infrastructure/repositories/SupplyRepository.js
const InsumoModel = require("../db/InsumoModel");
const CategoriaInsumoModel = require("../db/CategoriaInsumoModel");
const Supply = require("../../domain/entities/Insumo");

class SupplyRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Supply({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.nombre.toLowerCase().includes(term) ||
          i.category.toLowerCase().includes(term)
      );
    }
    if (filters.category !== undefined) {
      result = result.filter((i) => i.category === filters.category);
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombre: re }, { categoria: re }];
    }
    if (filters.categoria !== undefined) query.categoria = filters.categoria;
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await InsumoModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await InsumoModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await InsumoModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await InsumoModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await InsumoModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }

  // Catálogos
  findAllCategories() {
    return store.suppliesCategories().filter(c => c.estado === true);
  }

  findCategoryById(id) {
    const parsed = parseInt(id);
    return store.suppliesCategories().find(c => c.id === parsed && c.estado === true) || null;
  async findAllCategorias() {
    return CategoriaInsumoModel.find({ estado: true });
  }

  async findCategoriaById(id) {
    return CategoriaInsumoModel.findOne({ _id: id, estado: true }).catch(() => null);
  }
}

module.exports = SupplyRepository;
