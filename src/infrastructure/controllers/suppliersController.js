/**
 * suppliersController.js
 * 
 * Controlador para la gestión de Proveedores (Suppliers).
 * Recibe requests HTTP, delega operaciones al repositorio y retorna respuestas.
 * No contiene lógica de negocio — solo traduce HTTP ↔ repositorio.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const SupplierRepository = require("../repositories/SupplierRepository");
const { ok, created, badRequest, notFound, serverError, conflict } = require("../../shared/utils/response");

const repo = new SupplierRepository();

const getSuppliers = (req, res) => {
  try {
    const suppliers = repo.findAll(req.query);
    return ok(res, suppliers);
  } catch (err) {
    return serverError(res);
  }
};

const getSupplierById = (req, res) => {
  try {
    const supplier = repo.findById(req.params.id);
    if (!supplier) return notFound(res, "Proveedor no encontrado");
    return ok(res, supplier);
  } catch (err) {
    return serverError(res);
  }
};

const createSupplier = (req, res) => {
  try {
    const { nit, nombre_de_empresa, nombre_del_contacto, direccion, telefono, correo, sitio_web } = req.body;
    if (!nit || !nombre_de_empresa || !nombre_del_contacto || !direccion || !telefono || !correo) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    if (repo.findByNit(nit)) {
      return conflict(res, "Ya existe un proveedor con ese NIT");
    }
    if (repo.findByEmail(correo)) {
      return conflict(res, "Ya existe un proveedor con ese correo");
    }
    const supplier = repo.create({
      nit,
      nombre_de_empresa,
      nombre_del_contacto,
      direccion,
      telefono,
      correo,
      sitio_web,
      activo: true,
    });
    return created(res, supplier);
  } catch (err) {
    return serverError(res);
  }
};

const updateSupplier = (req, res) => {
  try {
    const supplier = repo.findById(req.params.id);
    if (!supplier) return notFound(res, "Proveedor no encontrado");
    const updated = repo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const deleteSupplier = (req, res) => {
  try {
    const supplier = repo.findById(req.params.id);
    if (!supplier) return notFound(res, "Proveedor no encontrado");
    repo.delete(req.params.id);
    return ok(res, { message: "Proveedor eliminado exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
