// infrastructure/repositories/PurchaseDetailRepository.js
const CompraDetailModel = require("../db/CompraDetailModel");
const PurchaseDetail = require("../../domain/entities/PurchaseDetail");

class PurchaseDetailRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new PurchaseDetail({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.purchaseId !== undefined) query.compraId = filters.purchaseId;
    const docs = await CompraDetailModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await CompraDetailModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await CompraDetailModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await CompraDetailModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await CompraDetailModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = PurchaseDetailRepository;
