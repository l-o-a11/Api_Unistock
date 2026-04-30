// infrastructure/repositories/TechnicalSpecificationsRepository.js
const TechnicalSpecificationsModel = require("../db/TechnicalSpecificationsModel");
const TechnicalSpecifications = require("../../domain/entities/TechnicalSpecifications");

class TechnicalSpecificationsRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new TechnicalSpecifications({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await TechnicalSpecificationsModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await TechnicalSpecificationsModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async save(data) {
    const doc = await TechnicalSpecificationsModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await TechnicalSpecificationsModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await TechnicalSpecificationsModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = TechnicalSpecificationsRepository;
