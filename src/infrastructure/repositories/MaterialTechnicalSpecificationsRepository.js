// infrastructure/repositories/MaterialTechnicalSpecificationsRepository.js
const MaterialTechnicalSpecificationsModel = require("../db/MaterialTechnicalSpecificationsModel");
const MaterialTechnicalSpecifications = require("../../domain/entities/MaterialTechnicalSpecifications");

class MaterialTechnicalSpecificationsRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new MaterialTechnicalSpecifications({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await MaterialTechnicalSpecificationsModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await MaterialTechnicalSpecificationsModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async save(data) {
    const doc = await MaterialTechnicalSpecificationsModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await MaterialTechnicalSpecificationsModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await MaterialTechnicalSpecificationsModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = MaterialTechnicalSpecificationsRepository;
