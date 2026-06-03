// infrastructure/repositories/MaterialTechnicalSpecificationsRepository.js
const mongoose = require("mongoose");
const MaterialTechnicalSpecificationsModel = require("../db/MaterialTechnicalSpecificationsModel");
const MaterialTechnicalSpecifications = require("../../domain/entities/MaterialTechnicalSpecifications");

class MaterialTechnicalSpecificationsRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new MaterialTechnicalSpecifications({
      ...obj,
      id: obj._id.toString(),
      id_producto: obj.id_producto?.toString?.() ?? obj.id_producto,
      id_ficha_tecnica: obj.id_ficha_tecnica?.toString?.() ?? obj.id_ficha_tecnica,
      id_insumo: obj.id_insumo?.toString?.() ?? obj.id_insumo,
      id_medida: obj.id_medida?.toString?.() ?? obj.id_medida,
    });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.id_producto) {
      if (!mongoose.isValidObjectId(filters.id_producto)) return [];
      query.id_producto = filters.id_producto;
    }
    if (filters.id_ficha_tecnica) {
      if (!mongoose.isValidObjectId(filters.id_ficha_tecnica)) return [];
      query.id_ficha_tecnica = filters.id_ficha_tecnica;
    }
    if (filters.id_insumo) {
  if (!mongoose.isValidObjectId(filters.id_insumo)) return [];
  query.id_insumo = filters.id_insumo;
}
    const docs = await MaterialTechnicalSpecificationsModel.find(query).sort({ createdAt: -1 });
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await MaterialTechnicalSpecificationsModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await MaterialTechnicalSpecificationsModel.create(data);
    return this._toEntity(doc);
  }

  async save(data) {
    return this.create(data);
  }

  async update(id, changes) {
    const doc = await MaterialTechnicalSpecificationsModel.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await MaterialTechnicalSpecificationsModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = MaterialTechnicalSpecificationsRepository;