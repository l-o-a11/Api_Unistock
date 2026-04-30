// infrastructure/repositories/ProductionRepository.js
const ProductionOrderModel = require("../db/ProductionOrderModel");
const Production = require("../../domain/entities/Production");

class ProductionRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Production({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.cliente) query.cliente = new RegExp(filters.cliente, "i");
    if (filters.id_usuario) query.id_usuario = filters.id_usuario;
    const docs = await ProductionOrderModel.find(query).sort({ createdAt: -1 });
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await ProductionOrderModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await ProductionOrderModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await ProductionOrderModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await ProductionOrderModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = ProductionRepository;
