/**
 * productController.js
 * 
 * Controlador para la gestión de Productos.
 * Maneja operaciones CRUD para productos.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const mongoose = require("mongoose");
const productRepository = require("../repositories/ProductRepository");
const technicalSpecificationsRepository = require("../repositories/TechnicalSpecificationsRepository");
const materialTechnicalSpecificationsRepository = require("../repositories/MaterialTechnicalSpecificationsRepository");
const { ok, created, badRequest, notFound, serverError, conflict } = require("../../shared/utils/response");

const repo = new productRepository();
const techSpecRepo = new technicalSpecificationsRepository();
const materialTechSpecRepo = new materialTechnicalSpecificationsRepository();

const resolveProduct = async (productIdentifier) => {
  if (!productIdentifier) return null;

  if (mongoose.isValidObjectId(productIdentifier)) {
    const product = await repo.findById(productIdentifier);
    if (product) return product;
  }

  return await repo.findByReference(String(productIdentifier));
};

const resolveProductId = async (productIdentifier) => {
  const product = await resolveProduct(productIdentifier);
  return product?.id ?? null;
};

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
    const product = await resolveProduct(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");
    return ok(res, product);
  } catch (err) {
    return serverError(res);
  }
};

const createProduct = async (req, res) => {
  let product = null;
  let techSpec = null;

  try {
    const fichaTecnica = req.body.ficha_tecnica || req.body.technicalSheet || req.body.fichaTecnica;
    const materiales = fichaTecnica?.materiales || fichaTecnica?.materials || [];

    if (!fichaTecnica) {
      return badRequest(res, "La ficha tecnica es requerida para crear el producto");
    }

    if (!Array.isArray(materiales) || materiales.length === 0) {
      return badRequest(res, "La ficha tecnica debe tener al menos un material");
    }

    const backendData = {
      id_categorias: req.body.idCategoria || req.body.id_categorias,
      imagenes_Url: req.body.imagenesUrl || req.body.imagenes_Url || [],
      referencia: req.body.referencia,
      nombre: req.body.nombre,
      precio: req.body.precio,
      stock: req.body.stock,
    };

    const { id_categorias, referencia, nombre, precio, stock } = backendData;
    if (!id_categorias || !referencia || !nombre || precio === undefined || stock === undefined) {
      return badRequest(res, "Campos requeridos faltantes: id_categorias, referencia, nombre, precio, stock");
    }

    if (await repo.findByReference(referencia)) {
      return conflict(res, "Ya existe un producto con esa referencia");
    }

    product = await repo.create({
      ...backendData,
      estado: true,
    });

    const productId = product.id;
    const today = new Date().toISOString().split("T")[0];

    techSpec = await techSpecRepo.create({
      id_producto: productId,
      responsable: fichaTecnica.responsable || fichaTecnica.createdBy || fichaTecnica.client || "Sin responsable",
      fecha_inicio: fichaTecnica.fecha_inicio || fichaTecnica.date || today,
      fecha_fin: fichaTecnica.fecha_fin || fichaTecnica.date || today,
      versiones: Number(fichaTecnica.versiones || fichaTecnica.version || 1),
      descripciones: fichaTecnica.descripciones || fichaTecnica.description || fichaTecnica.observations || "Ficha tecnica",
      client: fichaTecnica.client || "",
      ref: fichaTecnica.ref || req.body.referencia || "",
      type: fichaTecnica.type || "",
      description: fichaTecnica.description || fichaTecnica.descripciones || "",
      observations: fichaTecnica.observations || "",
      createdBy: fichaTecnica.createdBy || fichaTecnica.responsable || "",
      image: fichaTecnica.image || null,
      fabrics: fichaTecnica.fabrics || [],
      cups: fichaTecnica.cups || [],
      closures: fichaTecnica.closures || [],
      accessories: fichaTecnica.accessories || [],
      measurements: fichaTecnica.measurements || [],
    });

    const createdMaterials = [];
    for (const material of materiales) {
      const cantidades = material.cantidades ?? material.cantidad;
      if (!cantidades) {
        throw new Error("Todos los materiales deben tener cantidades");
      }

      const createdMaterial = await materialTechSpecRepo.create({
        id_producto: productId,
        id_ficha_tecnica: techSpec.id,
        id_insumo: material.id_insumo || material.id_insumos || undefined,
        id_medida: material.id_medida || undefined,
        nombre: material.nombre || material.name || "",
        unidad: material.unidad || material.medida || "",
        cantidades: String(cantidades),
        observaciones: material.observaciones || material.observations || "",
      });
      createdMaterials.push(createdMaterial.toJSON());
    }

    return created(res, {
      product: product.toJSON ? product.toJSON() : product,
      ficha_tecnica: {
        ...(techSpec.toJSON ? techSpec.toJSON() : techSpec),
        materiales: createdMaterials,
      },
    });
  } catch (err) {
    if (techSpec?.id) await techSpecRepo.delete(techSpec.id).catch(() => null);
    if (product?.id) await repo.delete(product.id).catch(() => null);
    return serverError(res, err.message);
  }
};
const updateProduct = async (req, res) => {
  try {
    const product = await resolveProduct(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");
    
    // Validar si la nueva referencia ya existe
    if (req.body.referencia && req.body.referencia !== product.referencia) {
      if (await repo.findByReference(req.body.referencia)) {
        return conflict(res, "Ya existe un producto con esa referencia");
      }
    }

    const updated = await repo.update(product.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await resolveProduct(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");
    await repo.delete(product.id);
    return ok(res, { message: "Producto eliminado exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

const toggleProductStatus = async (req, res) => {
  try {
    const product = await resolveProduct(req.params.id);
    if (!product) return notFound(res, "Producto no encontrado");

    const updated = await repo.update(product.id, {
      estado: !product.estado,
    });

    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const getTechnicalSpecifications = async (req, res) => {
  try {
    const productId = await resolveProductId(req.params.id);
    if (!productId) return notFound(res, "Producto no encontrado");

    const techSpecs = await techSpecRepo.findAll({ id_producto: productId });
    const withMaterials = await Promise.all(
      techSpecs.map(async (techSpec) => {
        const sheet = techSpec.toJSON ? techSpec.toJSON() : techSpec;
        const materiales = await materialTechSpecRepo.findAll({
          id_producto: productId,
          id_ficha_tecnica: sheet.id,
        });
        return {
          ...sheet,
          materiales: materiales.map((item) => item.toJSON()),
        };
      })
    );
    return ok(res, withMaterials);
  } catch (err) {
    return serverError(res, err.message);
  }
};

const getTechnicalSpecificationById = async (req, res) => {
  try {
    const techSpec = await techSpecRepo.findById(req.params.techSpecId);
    if (!techSpec) return notFound(res, "Ficha tecnica no encontrada");

    const productId = await resolveProductId(req.params.id);
    if (!productId) return notFound(res, "Producto no encontrado");

    const sheet = techSpec.toJSON ? techSpec.toJSON() : techSpec;
    const materiales = await materialTechSpecRepo.findAll({
      id_producto: productId,
      id_ficha_tecnica: sheet.id,
    });
    return ok(res, {
      ...sheet,
      materiales: materiales.map((item) => item.toJSON()),
    });
  } catch (err) {
    return serverError(res, err.message);
  }
};

const createTechnicalSpecification = async (req, res) => {
  try {
    const id_producto = req.params.id || req.body.id_producto;
    const productId = await resolveProductId(id_producto);
    if (!productId) return notFound(res, "Producto no encontrado");

    const { responsable, fecha_inicio, fecha_fin, versiones, descripciones } = req.body;
    if (!responsable || !fecha_inicio || !fecha_fin || !versiones || !descripciones) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const techSpec = await techSpecRepo.create({
      id_producto: productId,
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
    const productId = await resolveProductId(req.params.id);
    if (!productId) return notFound(res, "Producto no encontrado");

    const filters = { id_producto: productId };
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
    const rawProductId = req.params.id || req.body.id_producto;
    const id_producto = await resolveProductId(rawProductId);
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