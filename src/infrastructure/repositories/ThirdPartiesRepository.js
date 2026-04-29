// infrastructure/repositories/ThirdPartiesRepository.js
const ThirdPartiesModel = require("../db/ThirdPartiesModel");
const ThirdParties = require("../../domain/entities/ThirdParties");

class ThirdPartiesRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new ThirdParties({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombre: re }, { contacto: re }];
    }
    if (filters.estado !== undefined) query.estado = filters.estado === "true" || filters.estado === true;
    const docs = await ThirdPartiesModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await ThirdPartiesModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await ThirdPartiesModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await ThirdPartiesModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await ThirdPartiesModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = ThirdPartiesRepository;
