/**
 * compraController.js
 * 
 * Controlador para la gestión de Compras.
 * Maneja operaciones CRUD para compras.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const CompraRepository = require("../repositories/CompraRepository");
const CompraDetailRepository = require("../repositories/CompraDetailRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const compraRepo = new CompraRepository();
const compraDetailRepo = new CompraDetailRepository();

const crearCompra = (req, res) => {
  try {
    const { fecha, proveedorId, total, estado = true } = req.body;
    if (!fecha || !proveedorId || total === undefined) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const compra = compraRepo.create({
      fecha,
      proveedorId: parseInt(proveedorId),
      total: parseFloat(total),
      estado,
    });
    return created(res, compra);
  } catch (err) {
    return serverError(res);
  }
};

const obtenerCompras = (req, res) => {
  try {
    const compras = compraRepo.findAll(req.query);
    return ok(res, compras);
  } catch (err) {
    return serverError(res);
  }
};

const obtenerCompra = (req, res) => {
  try {
    const compra = compraRepo.findById(req.params.id);
    if (!compra) return notFound(res, "Compra no encontrada");
    return ok(res, compra);
  } catch (err) {
    return serverError(res);
  }
};

const actualizarCompra = (req, res) => {
  try {
    const compra = compraRepo.findById(req.params.id);
    if (!compra) return notFound(res, "Compra no encontrada");
    const updated = compraRepo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const eliminarCompra = (req, res) => {
  try {
    const compra = compraRepo.findById(req.params.id);
    if (!compra) return notFound(res, "Compra no encontrada");
    compraRepo.delete(req.params.id);
    return ok(res, { message: "Compra eliminada exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

const getCompraDetail = (req, res) => {
  try {
    const details = compraDetailRepo.findAll(req.query);
    return ok(res, details);
  } catch (err) {
    return serverError(res);
  }
};

const createCompraDetail = (req, res) => {
  try {
    const { compraId, productoId, cantidad, precioUnitario, subtotal } = req.body;
    if (!compraId || !productoId || cantidad === undefined || precioUnitario === undefined) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const detail = compraDetailRepo.create({
      compraId: parseInt(compraId),
      productoId: parseInt(productoId),
      cantidad: parseFloat(cantidad),
      precioUnitario: parseFloat(precioUnitario),
      subtotal: subtotal !== undefined ? parseFloat(subtotal) : parseFloat(cantidad) * parseFloat(precioUnitario),
    });
    return created(res, detail);
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  crearCompra,
  obtenerCompras,
  obtenerCompra,
  actualizarCompra,
  eliminarCompra,
  getCompraDetail,
  createCompraDetail,
};