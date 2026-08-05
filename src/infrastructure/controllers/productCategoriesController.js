/**
 * productCategoriesController.js
 * 
 * Controlador para la gestión de Categorías de Productos.
 * Maneja operaciones CRUD para categorías de productos.
 * Sigue el patrón de suppliersController para consistencia.
 * 
 * @author Unistock Team
 * @version 2.0.0
 */

const ProductCategoriesRepository = require("../repositories/ProductCategoryRepository");
const { ok, created, badRequest, notFound, serverError, conflict } = require("../../shared/utils/response");

const repo = new ProductCategoriesRepository();

const normalizeCategoryInput = (body = {}) => ({
  nombre: body.nombre || body.name || "",
  descripcion: body.descripcion ?? body.description ?? body.descripción ?? "",
});

const getProductCategories = async (req, res) => {
  try {
    const productCategories = await repo.findAll(req.query);
    return ok(res, productCategories.map(cat => cat.toJSON()));
  } catch (err) {
    console.error("Error en getProductCategories:", err);
    return serverError(res);
  }
};

const getProductCategoryById = async (req, res) => {
  try {
    const productCategory = await repo.findById(req.params.id);
    if (!productCategory) return notFound(res, "Categoría de producto no encontrada");
    return ok(res, productCategory.toJSON());
  } catch (err) {
    console.error("Error en getProductCategoryById:", err);
    return serverError(res);
  }
};

const createProductCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = normalizeCategoryInput(req.body);

    // Validar campos requeridos
    if (!nombre || !descripcion) {
      return badRequest(res, "Los campos nombre y descripción son requeridos");
    }

    // Verificar que la categoría no exista ya
    const existingCategory = await repo.findByName(nombre);
    if (existingCategory) {
      return conflict(res, "Ya existe una categoría de producto con ese nombre");
    }

    // Crear la categoría
    const productCategory = await repo.create({
      nombre,
      descripcion,
      estado: true,
    });

    return created(res, productCategory.toJSON());
  } catch (err) {
    console.error("Error en createProductCategory:", err);
    return serverError(res);
  }
};

const updateProductCategory = async (req, res) => {
  try {
    const productCategory = await repo.findById(req.params.id);
    if (!productCategory) return notFound(res, "Categoría de producto no encontrada");

    // Si se actualiza el nombre, verificar que no exista otra con ese nombre
    if (req.body.nombre && req.body.nombre !== productCategory.nombre) {
      const existingCategory = await repo.findByName(req.body.nombre);
      if (existingCategory && existingCategory.id !== productCategory.id) {
        return conflict(res, "Ya existe una categoría de producto con ese nombre");
      }
    }

    const normalized = normalizeCategoryInput(req.body);
    const changes = {};
    const hasDescription = ["descripcion", "description", "descripción"].some(
      (key) => Object.prototype.hasOwnProperty.call(req.body, key)
    );

    if (normalized.nombre) changes.nombre = normalized.nombre;
    if (hasDescription) changes.descripcion = normalized.descripcion;

    const updated = await repo.update(req.params.id, changes);
    return ok(res, updated.toJSON());
  } catch (err) {
    console.error("Error en updateProductCategory:", err);
    return serverError(res);
  }
};

const deleteProductCategory = async (req, res) => {
  try {
    const productCategory = await repo.findById(req.params.id);
    if (!productCategory) return notFound(res, "Categoría de producto no encontrada");
    
    // Verificar si hay productos asociados
    const hasProducts = await repo.hasAssociatedProducts(req.params.id);
    if (hasProducts) {
      return conflict(res, "No se puede eliminar una categoría que tiene productos asociados");
    }
    
    // Eliminar la categoría
    await repo.delete(req.params.id);
    return ok(res, { message: "Categoría de producto eliminada exitosamente" });
  } catch (err) {
    console.error("Error en deleteProductCategory:", err);
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
