/**
 * productCategoriesController.js
 * 
 * Controlador para la gestión de Categorías de Productos.
 * Maneja operaciones CRUD para categorías de productos.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const ProductCategoriesRepository = require("../repositories/ProductCategoryRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const repo = new ProductCategoriesRepository();

const getProductCategories = async (req, res) => {
  try {
    const productCategories = await repo.findAll(req.query);
    return ok(res, productCategories);
  } catch (err) {
    return serverError(res);
  }
};

const getProductCategoryById = async (req, res) => {
  try {
    const productCategory = await repo.findById(req.params.id);
    if (!productCategory) return notFound(res, "Categoría de producto no encontrada");
    return ok(res, productCategory);
  } catch (err) {
    return serverError(res);
  }
};

const createProductCategory = async (req, res) => {
  try {
    const { nombre, descripción } = req.body;
    if (!nombre || !descripción) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const productCategory = await repo.create({
      nombre,
      descripción,
      estado: true,
    });
    return created(res, productCategory);
  } catch (err) {
    return serverError(res);
  }
};

const updateProductCategory = async (req, res) => {
  try {
    const productCategory = await repo.findById(req.params.id);
    if (!productCategory) return notFound(res, "Categoría de producto no encontrada");
    const updated = await repo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const deleteProductCategory = async (req, res) => {
  try {
    const productCategory = await repo.findById(req.params.id);
    if (!productCategory) return notFound(res, "Categoría de producto no encontrada");
    await repo.delete(req.params.id);
    return ok(res, { message: "Categoría de producto eliminada exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  getProductCategories,
  getProductCategoryById,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory,
};
