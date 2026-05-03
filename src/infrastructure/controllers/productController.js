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
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const repo = new productRepository();
const techSpecRepo = new technicalSpecificationsRepository();
const materialTechSpecRepo = new materialTechnicalSpecificationsRepository();

const getProducts = (req, res) => {
  try {
    const products = repo.findAll(req.query);
    return ok(res, products);
  } catch (err) {
    return serverError(res);
  }
};

const getProductById = (req, res) => {
  try {
    const product = repo.findById(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");
    return ok(res, product);
  } catch (err) {
    return serverError(res);
  }
};

const createProduct = (req, res) => {
  try {
    const { id_categorias, imagenes_Url, referencia, nombre, precio, stock } = req.body;
    if (!id_categorias || !referencia || !nombre || !precio || !stock) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const product = repo.create({
      id_categorias,
      imagenes_Url,
      referencia,
      nombre,
      precio,
      stock,
      estado: true,
    });
    return created(res, product);
  } catch (err) {
    return serverError(res);
  }
};

const updateProduct = (req, res) => {
  try {
    const product = repo.findById(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");
    const updated = repo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const deleteProduct = (req, res) => {
  try {
    const product = repo.findById(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");
    repo.delete(req.params.id);
    return ok(res, { message: "Producto eliminado exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

const toggleProductStatus = (req, res) => {
  try {
    const product = repo.findById(req.params.id);

    if (!product) {
      return notFound(res, "Producto no encontrado");
    }

    const updated = repo.update(req.params.id, {
      estado: !product.estado,
    });

    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const getTechnicalSpecifications = (req, res) => {
  try {
    const techSpecs = techSpecRepo.findAll({ id_producto: req.params.id });
    return ok(res, techSpecs);
  } catch (err) {
    return serverError(res);
  }
};

const getTechnicalSpecificationById = (req, res) => {
  try {
    const techSpec = techSpecRepo.findById(req.params.techSpecId);
    if (!techSpec) return notFound(res, "Ficha técnica no encontrada");
    return ok(res, techSpec);
  } catch (err) {
    return serverError(res);
  }
};

const createTechnicalSpecification = (req, res) => {
  try {
    const { responsable, fecha_inicio, fecha_fin, versiones, descripciones } = req.body;
    if (!responsable || !fecha_inicio || !fecha_fin || !versiones || !descripciones) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const techSpec = techSpecRepo.create({
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

const updateTechnicalSpecification = (req, res) => {
  try {
    const techSpec = techSpecRepo.findById(req.params.id);
    if (!techSpec) return notFound(res, "Ficha técnica no encontrada");
    const updated = techSpecRepo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const deleteTechnicalSpecification = (req, res) => {
  try {
    const techSpec = techSpecRepo.findById(req.params.id);
    if (!techSpec) return notFound(res, "Ficha técnica no encontrada");
    techSpecRepo.delete(req.params.id);
    return ok(res, { message: "Ficha técnica eliminada exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

const getMaterialTechnicalSpecifications = (req, res) => {
  try {
    const materialTechSpecs = materialTechSpecRepo.findAll({ id_producto: req.params.id });
    return ok(res, materialTechSpecs);
  } catch (err) {
    return serverError(res);
  }
};

const getMaterialTechnicalSpecificationById = (req, res) => {
  try {
    const materialTechSpec = materialTechSpecRepo.findById(req.params.materialTechSpecId);
    if (!materialTechSpec) return notFound(res, "Especificación técnica del material no encontrada");
    return ok(res, materialTechSpec);
  } catch (err) {
    return serverError(res);
  }
};

const createMaterialTechnicalSpecification = (req, res) => {
  try {
    const { id_materiales, cantidades } = req.body;
    if (!id_materiales || !cantidades) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const materialTechSpec = materialTechSpecRepo.create({
      id_materiales,
      cantidades,
    });
    return created(res, materialTechSpec);
  } catch (err) {
    return serverError(res);
  }
};

const updateMaterialTechnicalSpecification = (req, res) => {
  try {
    const materialTechSpec = materialTechSpecRepo.findById(req.params.id);
    if (!materialTechSpec) return notFound(res, "Material de la ficha técnica no encontrado");
    const updated = materialTechSpecRepo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  } 
};
 
const deleteMaterialTechnicalSpecification = (req, res) => {
  try {
    const materialTechSpec = materialTechSpecRepo.findById(req.params.id);
    if (!materialTechSpec) return notFound(res, "Material de la ficha técnica no encontrado");
    materialTechSpecRepo.delete(req.params.id);
    return ok(res, { message: "Material de la ficha técnica eliminado exitosamente" });
  } catch (err) {
    return serverError(res);
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