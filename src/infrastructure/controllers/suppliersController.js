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
    const backendData = {
      nit: req.body.nit,
      nombre_de_empresa: req.body.nombreEmpresa,
      nombre_del_contacto: req.body.nombreContacto || '',
      direccion: req.body.direccion,
      telefono: req.body.telefono,
      correo: req.body.correoEmpresa,
      sitio_web: req.body.sitioWeb,
    };
    
    const { nit, nombre_de_empresa, nombre_del_contacto, direccion, telefono, correo, sitio_web } = backendData;
    
    if (!nit || !nombre_de_empresa || !nombre_del_contacto || !direccion || !telefono || !correo)
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    if (await repo.findByNit(nit)) return conflict(res, "Ya existe un proveedor con ese NIT");
    if (await repo.findByEmail(correo)) return conflict(res, "Ya existe un proveedor con ese correo");
    const supplier = await repo.create({ ...backendData, activo: true });
    return created(res, supplier);
  } catch (err) { return serverError(res); }
};


const updateSupplier = async (req, res) => {
  try {
    const supplier = await repo.findById(req.params.id);
    if (!supplier) return notFound(res, "Proveedor no encontrado");
    const updated = await repo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) { return serverError(res); }
};

const deleteSupplier = async (req, res) => {
  try {
    const supplier = await repo.findById(req.params.id);
    if (!supplier) return notFound(res, "Proveedor no encontrado");
    await repo.delete(req.params.id);
    return ok(res, { message: "Proveedor eliminado exitosamente" });
  } catch (err) { return serverError(res); }
};

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
