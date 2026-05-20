// infrastructure/repositories/TechnicalSpecificationsRepository.js
const TechnicalSpecificationsModel = require("../db/TechnicalSpecificationsModel");
const TechnicalSpecifications = require("../../domain/entities/TechnicalSpecifications");

class TechnicalSpecificationsRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new TechnicalSpecifications({
      ...obj,
      id: obj._id.toString(),
      id_producto: obj.id_producto?.toString?.() ?? obj.id_producto,
    });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.id_producto) query.id_producto = filters.id_producto;
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await TechnicalSpecificationsModel.find(query).sort({ versiones: -1, createdAt: -1 });
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await TechnicalSpecificationsModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await TechnicalSpecificationsModel.create(data);
    return this._toEntity(doc);
  }

  async save(data) {
    return this.create(data);
  }

  async update(id, changes) {
    const doc = await TechnicalSpecificationsModel.findByIdAndUpdate(id, changes, { new: true, runValidators: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await TechnicalSpecificationsModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = TechnicalSpecificationsRepository;