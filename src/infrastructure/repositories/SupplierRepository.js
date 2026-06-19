// infrastructure/repositories/SupplierRepository.js
const SuppliersModel = require("../db/SuppliersModel");
const Suppliers = require("../../domain/entities/Suppliers");

class SupplierRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Suppliers({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombre_de_empresa: re }, { correo: re }];
    }
    if (filters.activo !== undefined) query.activo = filters.activo === "true" || filters.activo === true;
    const docs = await SuppliersModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await SuppliersModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async findByNit(nit) {
    const doc = await SuppliersModel.findOne({ nit });
    return this._toEntity(doc);
  }

  async findByEmail(correo) {
    const doc = await SuppliersModel.findOne({ correo });
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await SuppliersModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await SuppliersModel.findByIdAndUpdate(id, changes, { returnDocument: 'after' }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await SuppliersModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = SupplierRepository;
