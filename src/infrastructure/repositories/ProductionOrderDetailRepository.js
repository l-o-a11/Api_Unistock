// infrastructure/repositories/ProductionOrderDetailRepository.js
const ProductionOrderDetailModel = require("../db/ProductionOrderDetailModel");
const ProductionOrderDetail = require("../../domain/entities/ProductionOrderDetail");

class ProductionOrderDetailRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new ProductionOrderDetail({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.id_orden) query.id_orden = filters.id_orden;
    const docs = await ProductionOrderDetailModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await ProductionOrderDetailModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await ProductionOrderDetailModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await ProductionOrderDetailModel.findByIdAndUpdate(id, changes, { returnDocument: 'after' }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await ProductionOrderDetailModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = ProductionOrderDetailRepository;
