// infrastructure/repositories/SupplyCategoryRepository.js

const SupplyCategoryModel = require("../db/SupplyCategoryModel");
const SupplyCategory = require("../../domain/entities/SupplyCategory");

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

    // FIX: por defecto solo mostrar activas (estado:true)
    // Solo se omite el filtro si se pasa estado="all"
    if (filters.estado === "all") {
      // sin filtro de estado
    } else if (filters.estado !== undefined && filters.estado !== "") {
      query.estado = filters.estado === "true" || filters.estado === true;
    } else {
      query.estado = true; // default: solo activas
    }

    const docs = await SupplyCategoryModel.find(query).sort({ nombre: 1 });
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
    const doc = await SupplyCategoryModel
      .findByIdAndUpdate(id, changes, { new: true })
      .catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await SupplyCategoryModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = SupplyCategoryRepository;
