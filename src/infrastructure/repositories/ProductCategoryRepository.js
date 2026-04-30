// infrastructure/repositories/ProductCategoryRepository.js
const ProductCategoryModel = require("../db/ProductCategoryModel");
const ProductCategory = require("../../domain/entities/ProductCategory");

class ProductCategoryRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new ProductCategory({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombre: re }, { descripción: re }];
    }
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await ProductCategoryModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await ProductCategoryModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async save(data) {
    const doc = await ProductCategoryModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await ProductCategoryModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await ProductCategoryModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = ProductCategoryRepository;
