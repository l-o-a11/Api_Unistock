// infrastructure/repositories/ProductRepository.js
const ProductModel = require("../db/ProductModel");
const Product = require("../../domain/entities/Products");

class ProductRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Product({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombre: re }, { referencia: re }];
    }
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await ProductModel.find(query).sort({ _id: 1 });
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await ProductModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async findByReference(referencia) {
    const doc = await ProductModel.findOne({ referencia }).catch(() => null);
    return this._toEntity(doc);
  }

  async save(data) {
    const doc = await ProductModel.create(data);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await ProductModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await ProductModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await ProductModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = ProductRepository;