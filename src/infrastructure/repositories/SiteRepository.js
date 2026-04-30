// infrastructure/repositories/SiteRepository.js
const SiteModel = require("../db/SiteModel");
const Site = require("../../domain/entities/Site");

class SiteRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Site({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombre: re }, { ciudad: re }, { barrio: re }];
    }
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await SiteModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await SiteModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async save(data) {
    const doc = await SiteModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await SiteModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await SiteModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = SiteRepository;
