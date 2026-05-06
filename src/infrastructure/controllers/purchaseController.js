/**
 * purchaseController.js
 *
 * Controlador para la gestión de Compras.
 * Maneja operaciones CRUD para compras.
 *
 * @author Unistock Team
 * @version 1.1.0
 */

const PurchaseRepository = require("../repositories/PurchaseRepository");
const PurchaseDetailRepository = require("../repositories/PurchaseDetailRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const purchaseRepo = new PurchaseRepository();
const purchaseDetailRepo = new PurchaseDetailRepository();

// ── Compras ───────────────────────────────────────────────────────────────────

const crearPurchase = async (req, res) => {
  try {
    const { fecha, proveedorId, total, estado = true, observaciones, numeroFactura } = req.body;
    if (!fecha || !proveedorId || total === undefined) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const purchase = await purchaseRepo.create({
      fecha,
      proveedorId,
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

const obtenerPurchases = async (req, res) => {
  try {
    const purchases = await purchaseRepo.findAll(req.query);
    return ok(res, purchases);
  } catch (err) {
    return serverError(res);
  }
};

const obtenerPurchase = async (req, res) => {
  try {
    const purchase = await purchaseRepo.findById(req.params.id);
    if (!purchase) return notFound(res, "Compra no encontrada");

    // Incluir los detalles de la compra en la respuesta
    const detalles = await purchaseDetailRepo.findAll({ purchaseId: req.params.id });
    return ok(res, { ...purchase, detalles });
  } catch (err) {
    return serverError(res);
  }
};

const actualizarPurchase = async (req, res) => {
  try {
    const purchase = await purchaseRepo.findById(req.params.id);
    if (!purchase) return notFound(res, "Compra no encontrada");
    const updated = await purchaseRepo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const eliminarPurchase = async (req, res) => {
  try {
    const purchase = await purchaseRepo.findById(req.params.id);
    if (!purchase) return notFound(res, "Compra no encontrada");
    await purchaseRepo.delete(req.params.id);
    return ok(res, { message: "Compra eliminada exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

/**
 * PATCH /compras/:id/anular
 * Alterna el campo `anulada` de la compra (toggle).
 */
const anularPurchase = async (req, res) => {
  try {
    const purchase = await purchaseRepo.findById(req.params.id);
    if (!purchase) return notFound(res, "Compra no encontrada");

    const nuevoValor = !purchase.anulada;
    const updated = await purchaseRepo.update(req.params.id, { anulada: nuevoValor });
    return ok(res, {
      ...updated,
      message: nuevoValor ? "Compra anulada exitosamente" : "Anulación revertida exitosamente",
    });
  } catch (err) {
    return serverError(res);
  }
};

// ── Detalles de compra ────────────────────────────────────────────────────────

const getPurchaseDetail = async (req, res) => {
  try {
    const details = await purchaseDetailRepo.findAll(req.query);
    return ok(res, details);
  } catch (err) {
    return serverError(res);
  }
};

/**
 * GET /compras/detalle-purchase/:id
 * Devuelve un detalle de compra por su ID.
 */
const getPurchaseDetailById = async (req, res) => {
  try {
    const detail = await purchaseDetailRepo.findById(req.params.id);
    if (!detail) return notFound(res, "Detalle de compra no encontrado");
    return ok(res, detail);
  } catch (err) {
    return serverError(res);
  }
};

const createPurchaseDetail = async (req, res) => {
  try {
    const { purchaseId, productoId, cantidad, precioUnitario, subtotal } = req.body;
    if (!purchaseId || !productoId || cantidad === undefined || precioUnitario === undefined) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }

    // Verificar que la compra existe
    const purchase = await purchaseRepo.findById(purchaseId);
    if (!purchase) return notFound(res, "Compra no encontrada");

    const detail = await purchaseDetailRepo.create({
      compraId: purchaseId,
      productoId,
      cantidad: parseFloat(cantidad),
      precioUnitario: parseFloat(precioUnitario),
      subtotal: subtotal !== undefined
        ? parseFloat(subtotal)
        : parseFloat(cantidad) * parseFloat(precioUnitario),
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
  anularPurchase,
  getPurchaseDetail,
  getPurchaseDetailById,
  createPurchaseDetail,
};
