// infrastructure/repositories/ThirdPartiesRepository.js
const mongoose = require("mongoose");
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
    const idsFilter = filters.ids
      ? (Array.isArray(filters.ids) ? filters.ids : [filters.ids])
      : [];
    if (idsFilter.length > 0) {
      query._id = { $in: idsFilter.map((id) => new mongoose.Types.ObjectId(id)) };
    }
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

  async findByDireccion(direccion, excludeId = null) {
    const normalized = String(direccion || "").trim();
    if (!normalized) return null;

    const query = { direccion: new RegExp(`^${this._escapeRegex(normalized)}$`, "i") };
    if (excludeId) query._id = { $ne: excludeId };

    const doc = await ThirdPartiesModel.findOne(query).catch(() => null);
    return this._toEntity(doc);
  }

  async findByTelefono(telefono, excludeId = null) {
    const normalized = String(telefono || "").trim();
    if (!normalized) return null;

    const query = { telefono: normalized };
    if (excludeId) query._id = { $ne: excludeId };

    const doc = await ThirdPartiesModel.findOne(query).catch(() => null);
    return this._toEntity(doc);
  }

  async findByNit(nit, excludeId = null) {
    const normalized = String(nit || "").trim();
    if (!normalized) return null;

    const query = { nit: normalized };
    if (excludeId) query._id = { $ne: excludeId };

    const doc = await ThirdPartiesModel.findOne(query).catch(() => null);
    return this._toEntity(doc);
  }

  async findByCorreo(correo, excludeId = null) {
    const normalized = String(correo || "").trim().toLowerCase();
    if (!normalized) return null;

    const query = {
      $or: [
        { correo_empresa: new RegExp(`^${this._escapeRegex(normalized)}$`, "i") },
        { correo_contacto: new RegExp(`^${this._escapeRegex(normalized)}$`, "i") },
      ],
    };
    if (excludeId) query._id = { $ne: excludeId };

    const doc = await ThirdPartiesModel.findOne(query).catch(() => null);
    return this._toEntity(doc);
  }

  _escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
