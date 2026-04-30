/**
 * purchaseController.js
 * 
 * Controlador para la gestión de Compras.
 * Maneja operaciones CRUD para compras.
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const PurchaseRepository = require("../repositories/PurchaseRepository");
const PurchaseDetailRepository = require("../repositories/PurchaseDetailRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const purchaseRepo = new PurchaseRepository();
const purchaseDetailRepo = new PurchaseDetailRepository();

const crearPurchase = (req, res) => {
  try {
    const { fecha, proveedorId, total, estado = true, observaciones, numeroFactura } = req.body;
    if (!fecha || !proveedorId || total === undefined) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const purchase = purchaseRepo.create({
      fecha,
      proveedorId: parseInt(proveedorId),
      total: parseFloat(total),
      estado,
      observaciones,
      numeroFactura,
    });
    return created(res, purchase);
  } catch (err) {
    return serverError(res);
  }
};

const obtenerPurchases = (req, res) => {
  try {
    const purchases = purchaseRepo.findAll(req.query);
    return ok(res, purchases);
  } catch (err) {
    return serverError(res);
  }
};

const obtenerPurchase = (req, res) => {
  try {
    const purchase = purchaseRepo.findById(req.params.id);
    if (!purchase) return notFound(res, "Compra no encontrada");
    return ok(res, purchase);
  } catch (err) {
    return serverError(res);
  }
};

const actualizarPurchase = (req, res) => {
  try {
    const purchase = purchaseRepo.findById(req.params.id);
    if (!purchase) return notFound(res, "Compra no encontrada");
    const updated = purchaseRepo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const eliminarPurchase = (req, res) => {
  try {
    const purchase = purchaseRepo.findById(req.params.id);
    if (!purchase) return notFound(res, "Compra no encontrada");
    purchaseRepo.delete(req.params.id);
    return ok(res, { message: "Compra eliminada exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

const getPurchaseDetail = (req, res) => {
  try {
    const details = purchaseDetailRepo.findAll(req.query);
    return ok(res, details);
  } catch (err) {
    return serverError(res);
  }
};

const createPurchaseDetail = (req, res) => {
  try {
    const { purchaseId, productoId, cantidad, precioUnitario, subtotal } = req.body;
    if (!purchaseId || !productoId || cantidad === undefined || precioUnitario === undefined) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const detail = purchaseDetailRepo.create({
      purchaseId: parseInt(purchaseId),
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
  crearPurchase,
  obtenerPurchases,
  obtenerPurchase,
  actualizarPurchase,
  eliminarPurchase,
  getPurchaseDetail,
  createPurchaseDetail,
};