/**
 * productController.js
 * 
 * Controlador para la gestión de Productos.
 * Maneja operaciones CRUD para productos.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const productRepository = require("../repositories/ProductRepository");
const technicalSpecificationsRepository = require("../repositories/TechnicalSpecificationsRepository");
const materialTechnicalSpecificationsRepository = require("../repositories/MaterialTechnicalSpecificationsRepository");
const { ok, created, badRequest, notFound, serverError, conflict } = require("../../shared/utils/response");

const repo = new productRepository();
const techSpecRepo = new technicalSpecificationsRepository();
const materialTechSpecRepo = new materialTechnicalSpecificationsRepository();

const getProducts = async (req, res) => {
  try {
    const products = await repo.findAll(req.query);
    return ok(res, products);
  } catch (err) {
    return serverError(res);
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await repo.findById(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");
    return ok(res, product);
  } catch (err) {
    return serverError(res);
  }
};

const createProduct = async (req, res) => {
  try {
    const backendData = {
      id_categorias: req.body.idCategoria || req.body.id_categorias,
      imagenes_Url: req.body.imagenesUrl || req.body.imagenes_Url || [],
      referencia: req.body.referencia,
      nombre: req.body.nombre,
      precio: req.body.precio,
      stock: req.body.stock,
    };

    const { id_categorias, imagenes_Url, referencia, nombre, precio, stock } = backendData;
    
    if (!id_categorias || !referencia || !nombre || precio === undefined || stock === undefined) {
      return badRequest(res, "Campos requeridos faltantes: id_categorias, referencia, nombre, precio, stock");
    }

    if (await repo.findByReference(referencia)) {
      return conflict(res, "Ya existe un producto con esa referencia");
    }

    const product = await repo.create({
      ...backendData,
      estado: true,
    });
    return created(res, product);
  } catch (err) {
    return serverError(res);
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await repo.findById(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");
    
    // Validar si la nueva referencia ya existe
    if (req.body.referencia && req.body.referencia !== product.referencia) {
      if (await repo.findByReference(req.body.referencia)) {
        return conflict(res, "Ya existe un producto con esa referencia");
      }
    }

    const updated = await repo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await repo.findById(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");
    await repo.delete(req.params.id);
    return ok(res, { message: "Producto eliminado exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

const toggleProductStatus = async (req, res) => {
  try {
    const product = await repo.findById(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");

    const updated = await repo.update(req.params.id, {
      estado: !product.estado,
    });

    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const getTechnicalSpecifications = async (req, res) => {
  try {
    const techSpecs = await techSpecRepo.findAll({ id_producto: req.params.id });
    return ok(res, techSpecs);
  } catch (err) {
    return serverError(res);
  }
};

const getTechnicalSpecificationById = async (req, res) => {
  try {
    const techSpec = await techSpecRepo.findById(req.params.techSpecId);
    if (!techSpec) return notFound(res, "Ficha técnica no encontrada");
    return ok(res, techSpec);
  } catch (err) {
    return serverError(res);
  }
};

const createTechnicalSpecification = async (req, res) => {
  try {
    const { id_producto, responsable, fecha_inicio, fecha_fin, versiones, descripciones } = req.body;
    if (!id_producto || !responsable || !fecha_inicio || !fecha_fin || !versiones || !descripciones) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const techSpec = await techSpecRepo.create({
      id_producto,
      responsable,
      fecha_inicio,
      fecha_fin,
      versiones,
      descripciones,
    });
    return created(res, techSpec);
  } catch (err) {
    return serverError(res);
  }
};

const updateTechnicalSpecification = async (req, res) => {
  try {
    const techSpec = await techSpecRepo.findById(req.params.techSpecId);
    if (!techSpec) return notFound(res, "Ficha técnica no encontrada");
    const updated = await techSpecRepo.update(req.params.techSpecId, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const deleteTechnicalSpecification = async (req, res) => {
  try {
    const techSpec = await techSpecRepo.findById(req.params.techSpecId);
    if (!techSpec) return notFound(res, "Ficha técnica no encontrada");
    await techSpecRepo.delete(req.params.techSpecId);
    return ok(res, { message: "Ficha técnica eliminada exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

const getMaterialTechnicalSpecifications = async (req, res) => {
  try {
    const filters = { id_producto: req.params.id };
    if (req.params.techSpecId) filters.id_ficha_tecnica = req.params.techSpecId;
    const materialTechSpecs = await materialTechSpecRepo.findAll(filters);
    return ok(res, materialTechSpecs.map((item) => item.toJSON()));
  } catch (err) {
    return serverError(res, err.message);
  }
};

const getMaterialTechnicalSpecificationById = async (req, res) => {
  try {
    const materialTechSpec = await materialTechSpecRepo.findById(req.params.materialTechSpecId);
    if (!materialTechSpec) return notFound(res, "Material de la ficha tecnica no encontrado");
    return ok(res, materialTechSpec.toJSON());
  } catch (err) {
    return serverError(res, err.message);
  }
};

const createMaterialTechnicalSpecification = async (req, res) => {
  try {
    const id_producto = req.params.id || req.body.id_producto;
    const id_ficha_tecnica = req.params.techSpecId || req.body.id_ficha_tecnica;
    const cantidades = req.body.cantidades ?? req.body.cantidad;

    if (!id_producto || !id_ficha_tecnica || !cantidades) {
      return badRequest(res, "Campos requeridos: id_producto, id_ficha_tecnica y cantidades");
    }

    const materialTechSpec = await materialTechSpecRepo.create({
      id_producto,
      id_ficha_tecnica,
      id_insumo: req.body.id_insumo || req.body.id_insumos || undefined,
      id_medida: req.body.id_medida || undefined,
      nombre: req.body.nombre || req.body.name || "",
      unidad: req.body.unidad || req.body.medida || "",
      cantidades: String(cantidades),
      observaciones: req.body.observaciones || req.body.observations || "",
    });

    return created(res, materialTechSpec.toJSON());
  } catch (err) {
    return serverError(res, err.message);
  }
};

const updateMaterialTechnicalSpecification = async (req, res) => {
  try {
    const materialTechSpec = await materialTechSpecRepo.findById(req.params.materialTechSpecId);
    if (!materialTechSpec) return notFound(res, "Material de la ficha tecnica no encontrado");

    const changes = {
      ...req.body,
      id_insumo: req.body.id_insumo || req.body.id_insumos || req.body.id_insumo,
      cantidades: req.body.cantidades !== undefined ? String(req.body.cantidades) : req.body.cantidades,
    };

    const updated = await materialTechSpecRepo.update(req.params.materialTechSpecId, changes);
    return ok(res, updated.toJSON());
  } catch (err) {
    return serverError(res, err.message);
  }
};
 
const deleteMaterialTechnicalSpecification = async (req, res) => {
  try {
    const materialTechSpec = await materialTechSpecRepo.findById(req.params.materialTechSpecId);
    if (!materialTechSpec) return notFound(res, "Material de la ficha tecnica no encontrado");
    await materialTechSpecRepo.delete(req.params.materialTechSpecId);
    return ok(res, { message: "Material de la ficha tecnica eliminado exitosamente" });
  } catch (err) {
    return serverError(res, err.message);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getTechnicalSpecifications,
  getTechnicalSpecificationById,
  createTechnicalSpecification,
  updateTechnicalSpecification,
  deleteTechnicalSpecification,
  getMaterialTechnicalSpecifications,
  getMaterialTechnicalSpecificationById,
  createMaterialTechnicalSpecification,
  updateMaterialTechnicalSpecification,
  deleteMaterialTechnicalSpecification,
};