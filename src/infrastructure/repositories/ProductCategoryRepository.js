// infrastructure/repositories/ProductCategoryRepository.js
const ProductCategoryModel = require("../db/ProductCategoryModel");
const ProductModel = require("../db/ProductModel");
const ProductCategory = require("../../domain/entities/ProductCategory");

class ProductCategoryRepository {
  _normalizeDescription(obj = {}) {
    return obj.descripcion ?? obj.descripción ?? obj.description ?? "";
  }

  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new ProductCategory({
      ...obj,
      id: obj._id.toString(),
      descripcion: this._normalizeDescription(obj),
    });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.search) {
      const re = new RegExp(filters.search, "i");
      query.$or = [{ nombre: re }, { descripcion: re }, { descripción: re }];
    }
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true" || filters.estado === true;
    }
    const docs = await ProductCategoryModel.find(query).sort({ _id: 1 });
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await ProductCategoryModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async findByName(nombre) {
    const doc = await ProductCategoryModel.findOne({ nombre });
    return this._toEntity(doc);
  }

  async save(data) {
    const doc = await ProductCategoryModel.create(data);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await ProductCategoryModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await ProductCategoryModel.findByIdAndUpdate(id, changes, { new: true }).catch(() => null);
    return this._toEntity(doc);
  }

  async hasAssociatedProducts(categoryId) {
    const count = await ProductModel.countDocuments({ id_categorias: categoryId });
    return count > 0;
  }

  async delete(id) {
    const result = await ProductCategoryModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = ProductCategoryRepository;
