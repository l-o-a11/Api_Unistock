// infrastructure/repositories/PurchaseRepository.js
const CompraModel = require("../db/CompraModel");
const Purchase = require("../../domain/entities/Purchase");

class PurchaseRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Purchase({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.proveedorId !== undefined) query.proveedorId = filters.proveedorId;
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await CompraModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await CompraModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await CompraModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await CompraModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await CompraModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = PurchaseRepository;
