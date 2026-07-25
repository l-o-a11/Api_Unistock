// infrastructure/controllers/suppliersController.js
const SupplierRepository = require("../repositories/SupplierRepository");
const PurchaseRepository = require("../repositories/PurchaseRepository");
const { ok, created, badRequest, notFound, serverError, conflict } = require("../../shared/utils/response");

const repo = new SupplierRepository();
const purchaseRepo = new PurchaseRepository();

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
    // ✅ Fix: el NIT se guarda EXACTAMENTE como lo escribió el usuario (con guión si lo incluyó).
    // La normalización (quitar guiones) solo se usa para comparar duplicados, no para persistir.
    const nitOriginal = req.body.nit !== undefined && req.body.nit !== null
      ? String(req.body.nit).trim()
      : req.body.nit;

    const backendData = {
      nit:                 nitOriginal,
      nombre_de_empresa:   req.body.nombreEmpresa,
      nombre_del_contacto: req.body.nombreContacto || req.body.nombre_del_contacto || "",
      tipo_documento:      req.body.tipoDocumento,
      direccion:           req.body.direccion,
      telefono:            req.body.telefono,
      correo:              req.body.correoEmpresa,
      correo_del_contacto: req.body.correoContacto || req.body.correo_del_contacto || null,
      telefono_contacto:   req.body.telefonoContacto || req.body.telefono_contacto || null,
      tipo_documento_contacto: req.body.tipoDocumentoContacto || req.body.tipo_documento_contacto || null,
      sitio_web:           req.body.sitioWeb,
    };
    const { nit, nombre_de_empresa, nombre_del_contacto, tipo_documento, direccion, telefono, correo } = backendData;
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

    // ✅ Fix: el NIT no debe poder editarse si el proveedor ya tiene al
    // menos una compra asociada. Antes esto solo se verificaba en el
    // frontend contra localStorage (fácil de evadir y desincronizado de
    // la BD real); ahora se valida aquí contra la colección real de compras.
    const nitNuevo = req.body.nit;
    const nitCambio = nitNuevo !== undefined && String(nitNuevo).trim() !== String(supplier.nit || "").trim();
    if (nitCambio) {
      const compras = await purchaseRepo.findAll({ proveedorId: req.params.id });
      if (compras.length > 0) {
        return badRequest(res, "No se puede modificar el NIT: el proveedor ya tiene compras asociadas.");
      }
    }

    const changes = {
      nit:                 req.body.nit,
      nombre_de_empresa:   req.body.nombreEmpresa   ?? req.body.nombre_de_empresa,
      nombre_del_contacto: req.body.nombreContacto  ?? req.body.nombre_del_contacto,
      tipo_documento:      req.body.tipoDocumento   ?? req.body.tipo_documento,
      direccion:           req.body.direccion,
      telefono:            req.body.telefono,
      correo:              req.body.correoEmpresa    ?? req.body.correo,
      correo_del_contacto:   req.body.correoContacto   ?? req.body.correo_del_contacto,
      telefono_contacto:   req.body.telefonoContacto ?? req.body.telefono_contacto,
      tipo_documento_contacto: req.body.tipoDocumentoContacto ?? req.body.tipo_documento_contacto,
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

// ✅ GET /suppliers/:id/has-purchases — usado por el frontend para
// deshabilitar visualmente el campo NIT sin depender de localStorage
const checkSupplierHasPurchases = async (req, res) => {
  try {
    const supplier = await repo.findById(req.params.id);
    if (!supplier) return notFound(res, "Proveedor no encontrado");
    const compras = await purchaseRepo.findAll({ proveedorId: req.params.id });
    return ok(res, { hasPurchases: compras.length > 0, count: compras.length });
  } catch (err) {
    console.error("checkSupplierHasPurchases error:", err);
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

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier, toggleSupplier, checkSupplierHasPurchases };
