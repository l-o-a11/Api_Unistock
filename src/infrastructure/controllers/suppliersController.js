// infrastructure/controllers/suppliersController.js
const SupplierRepository = require("../repositories/SupplierRepository");
const { ok, created, badRequest, notFound, serverError, conflict } = require("../../shared/utils/response");

const repo = new SupplierRepository();

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await repo.findAll(req.query);
    return ok(res, suppliers);
  } catch (err) { return serverError(res); }
};

const getSupplierById = async (req, res) => {
  try {
    const supplier = await repo.findById(req.params.id);
    if (!supplier) return notFound(res, "Proveedor no encontrado");
    return ok(res, supplier);
  } catch (err) { return serverError(res); }
};

const createSupplier = async (req, res) => {
  try {
    // NIT puede venir con guiones (ej: 11111118-3). Persistimos como String.
    const nitNorm = req.body.nit !== undefined && req.body.nit !== null
      ? String(req.body.nit).replace(/-/g, "").trim()
      : req.body.nit;

    const backendData = {
      nit:                 nitNorm,
      nombre_de_empresa:   req.body.nombreEmpresa,
      nombre_del_contacto: req.body.nombreContacto || "",
      direccion:           req.body.direccion,
      telefono:            req.body.telefono,
      correo:              req.body.correoEmpresa,
      sitio_web:           req.body.sitioWeb,
    };
    const { nit, nombre_de_empresa, nombre_del_contacto, direccion, telefono, correo } = backendData;
    if (!nit || !nombre_de_empresa || !nombre_del_contacto || !direccion || !telefono || !correo)
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");

    // Comparar NIT normalizado (sin guiones) para evitar duplicados por formato
    const all = await repo.findAll({});
    if (all.some(s => String(s.nit || "").replace(/-/g, "").trim() === String(nit).replace(/-/g, "").trim()))
      return conflict(res, "Ya existe un proveedor con ese NIT");

    if (await repo.findByEmail(correo))
      return conflict(res, "Ya existe un proveedor con ese correo");

    const supplier = await repo.create({ ...backendData, activo: true });
    return created(res, supplier);
  } catch (err) {
    console.error("createSupplier error:", err);
    return serverError(res);
  }
};

const updateSupplier = async (req, res) => {
  try {
    const supplier = await repo.findById(req.params.id);
    if (!supplier) return notFound(res, "Proveedor no encontrado");
    const changes = {
      nit:                 req.body.nit,
      nombre_de_empresa:   req.body.nombreEmpresa   ?? req.body.nombre_de_empresa,
      nombre_del_contacto: req.body.nombreContacto  ?? req.body.nombre_del_contacto,
      direccion:           req.body.direccion,
      telefono:            req.body.telefono,
      correo:              req.body.correoEmpresa    ?? req.body.correo,
      sitio_web:           req.body.sitioWeb         ?? req.body.sitio_web,
    };
    Object.keys(changes).forEach(k => changes[k] === undefined && delete changes[k]);
    const updated = await repo.update(req.params.id, changes);
    return ok(res, updated);
  } catch (err) {
    console.error("updateSupplier error:", err);
    return serverError(res);
  }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await repo.findById(req.params.id);
    if (!supplier) return notFound(res, "Proveedor no encontrado");
    await repo.delete(req.params.id);
    return ok(res, { message: "Proveedor eliminado exitosamente" });
  } catch (err) { return serverError(res); }
};

// PATCH /api/suppliers/:id/toggle — Activar / Inactivar
const toggleSupplier = async (req, res) => {
  try {
    const supplier = await repo.findById(req.params.id);
    if (!supplier) return notFound(res, "Proveedor no encontrado");
    const nuevoEstado = !(supplier.activo ?? supplier.estado ?? true);
    const updated = await repo.update(req.params.id, { activo: nuevoEstado });
    return ok(res, updated);
  } catch (err) {
    console.error("toggleSupplier error:", err);
    return serverError(res);
  }
};

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, toggleSupplier };
