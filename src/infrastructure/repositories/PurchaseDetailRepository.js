// infrastructure/repositories/PurchaseDetailRepository.js

const PurchaseDetailModel = require("../db/PurchaseDetailModel");
const PurchaseDetail = require("../../domain/entities/PurchaseDetail");

class PurchaseDetailRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new PurchaseDetail({
      ...obj,
      id: obj._id.toString(),
      compraId: obj.compraId?.toString() ?? null,
      productoId: obj.productoId?.toString() ?? null,
      insumoId: obj.insumoId?.toString() ?? null,
    });
  }

  async findAll(filters = {}) {
    const query = {};
    // Acepta compraId o purchaseId (compatibilidad con el frontend)
    if (filters.compraId) query.compraId = filters.compraId;
    if (filters.purchaseId) query.compraId = filters.purchaseId;

    const docs = await PurchaseDetailModel
      .find(query)
      .populate("productoId", "nombre")
      .populate("insumoId", "nombre")
      .sort({ createdAt: 1 });

    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await PurchaseDetailModel
      .findById(id)
      .populate("productoId", "nombre")
      .populate("insumoId", "nombre")
      .catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await PurchaseDetailModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await PurchaseDetailModel
      .findByIdAndUpdate(id, changes, { new: true })
      .catch(() => null);
    return this._toEntity(doc);
  }

  async deleteByCompraId(compraId) {
    await PurchaseDetailModel.deleteMany({ compraId });
  }

  async delete(id) {
    const result = await PurchaseDetailModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = PurchaseDetailRepository;