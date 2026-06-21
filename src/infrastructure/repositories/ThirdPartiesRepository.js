// infrastructure/repositories/ThirdPartiesRepository.js
const ThirdPartiesModel = require("../db/ThirdPartiesModel");
const ThirdParties = require("../../domain/entities/ThirdParties");

class ThirdPartiesRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new ThirdParties({
      ...obj,
      id: obj._id.toString(),
      codigo: obj.codigo ?? obj.codigo_tercero ?? '',
    });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombre_empresa: re }, { nombre_contacto: re }, { nombre: re }, { contacto: re }];
    }
    if (filters.estado !== undefined) query.estado = filters.estado === "true" || filters.estado === true;
    const docs = await ThirdPartiesModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await ThirdPartiesModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async findByCompanyName(nombre, excludeId = null) {
    const normalized = String(nombre || "").trim();
    if (!normalized) return null;

    const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const query = { nombre_empresa: new RegExp(`^${escaped}$`, "i") };
    if (excludeId) query._id = { $ne: excludeId };

    const doc = await ThirdPartiesModel.findOne(query).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await ThirdPartiesModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await ThirdPartiesModel.findByIdAndUpdate(id, changes, { returnDocument: 'after' }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await ThirdPartiesModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = ThirdPartiesRepository;
