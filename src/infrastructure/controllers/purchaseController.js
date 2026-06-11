/**
 * purchaseController.js
 *
 * Controlador para la gestión de Compras.
 * Patrón: igual a productionController — usa repositorios directamente,
 * sin pasar por use-cases intermedios excepto para AnularPurchase y CreatePurchase
 * (que tienen lógica de negocio propia).
 */

const PurchaseRepository = require("../repositories/PurchaseRepository");
const PurchaseDetailRepository = require("../repositories/PurchaseDetailRepository");
const AnularPurchase = require("../../application/use-cases/purchases/AnularPurchase");
const CreatePurchase = require("../../application/use-cases/purchases/CreatePurchase");

const {
  ok, created, badRequest, notFound, conflict, unprocessable, serverError,
} = require("../../shared/utils/response");

const purchaseRepo = new PurchaseRepository();
const purchaseDetailRepo = new PurchaseDetailRepository();
const anularUC = new AnularPurchase(purchaseRepo);
const createUC = new CreatePurchase(purchaseRepo);

// ── GET /api/compras ──────────────────────────────────────────────────────────
// Query params opcionales: anulada=true|false, proveedorId, numeroFactura
const obtenerPurchases = async (req, res) => {
  try {
    const purchases = await purchaseRepo.findAll(req.query);
    return ok(res, purchases);
  } catch (err) {
    console.error("[obtenerPurchases]", err);
    return serverError(res);
  }
};

// ── GET /api/compras/:id ──────────────────────────────────────────────────────
// Devuelve la compra + sus detalles embebidos
const obtenerPurchase = async (req, res) => {
  try {
    const purchase = await purchaseRepo.findById(req.params.id);
    if (!purchase) return notFound(res, "Compra no encontrada");

    const detalles = await purchaseDetailRepo.findAll({ compraId: req.params.id });
    return ok(res, { ...purchase.toPublic(), detalles: detalles.map((d) => d.toPublic()) });
  } catch (err) {
    console.error("[obtenerPurchase]", err);
    return serverError(res);
  }
};

// ── POST /api/compras ─────────────────────────────────────────────────────────
// Body: { fecha, proveedorId, total, observaciones, numeroFactura, detalles[] }
// Crea la compra y sus detalles en una sola llamada (atómico a nivel aplicación)
const crearPurchase = async (req, res) => {
  try {
    const { detalles = [], ...purchaseData } = req.body;

    // Crear cabecera (use case valida duplicado de factura)
    let purchase;
    try {
      purchase = await createUC.execute(purchaseData);
    } catch (err) {
      if (err.statusCode === 409) return conflict(res, err.message);
      if (err.statusCode === 422) return unprocessable(res, err.message);
      throw err;
    }

    // Crear detalles
    const detallesCreados = [];
    for (const d of detalles) {
      if (!d.cantidad || !d.precioUnitario) continue; // silenciar detalles incompletos

      const subtotal = d.subtotal !== undefined
        ? parseFloat(d.subtotal)
        : parseFloat(d.cantidad) * parseFloat(d.precioUnitario);

      const detalle = await purchaseDetailRepo.create({
        compraId: purchase.id,
        productoId: d.productoId ?? null,
        insumoId: d.insumoId ?? null,
        nombre: d.nombre ?? null,
        cantidad: parseFloat(d.cantidad),
        precioUnitario: parseFloat(d.precioUnitario),
        subtotal,
      });
      detallesCreados.push(detalle.toPublic());
    }

    return created(res, { ...purchase, detalles: detallesCreados });
  } catch (err) {
    console.error("[crearPurchase]", err);
    return serverError(res);
  }
};

// ── PUT /api/compras/:id ──────────────────────────────────────────────────────
const actualizarPurchase = async (req, res) => {
  try {
    const purchase = await purchaseRepo.findById(req.params.id);
    if (!purchase) return notFound(res, "Compra no encontrada");

    if (purchase.estaAnulada()) {
      return badRequest(res, "No se puede editar una compra anulada");
    }

    // No permitir editar campos de anulación por esta ruta
    const { motivoAnulacion, fechaAnulacion, anulada, ...cambiosPermitidos } = req.body;

    const updated = await purchaseRepo.update(req.params.id, cambiosPermitidos);
    return ok(res, updated.toPublic());
  } catch (err) {
    console.error("[actualizarPurchase]", err);
    return serverError(res);
  }
};

// ── DELETE /api/compras/:id ───────────────────────────────────────────────────
const eliminarPurchase = async (req, res) => {
  try {
    const purchase = await purchaseRepo.findById(req.params.id);
    if (!purchase) return notFound(res, "Compra no encontrada");

    // Eliminar detalles primero
    await purchaseDetailRepo.deleteByCompraId(req.params.id);
    await purchaseRepo.delete(req.params.id);

    return ok(res, { message: "Compra eliminada correctamente" });
  } catch (err) {
    console.error("[eliminarPurchase]", err);
    return serverError(res);
  }
};

// ── PATCH /api/compras/:id/anular ─────────────────────────────────────────────
// Body: { motivo: "texto obligatorio" }
const anularPurchase = async (req, res) => {
  try {
    const { motivo } = req.body;

    const updated = await anularUC.execute(req.params.id, motivo);
    return ok(res, { ...updated, message: "Compra anulada correctamente" });
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 422) return unprocessable(res, err.message);
    if (err.statusCode === 400) return badRequest(res, err.message);
    console.error("[anularPurchase]", err);
    return serverError(res);
  }
};

// ── GET /api/compras/detalle-purchase ─────────────────────────────────────────
// Query: ?compraId=xxx o ?purchaseId=xxx
const getPurchaseDetail = async (req, res) => {
  try {
    const details = await purchaseDetailRepo.findAll(req.query);
    return ok(res, details.map((d) => d.toPublic()));
  } catch (err) {
    console.error("[getPurchaseDetail]", err);
    return serverError(res);
  }
};

// ── GET /api/compras/detalle-purchase/:id ─────────────────────────────────────
const getPurchaseDetailById = async (req, res) => {
  try {
    const detail = await purchaseDetailRepo.findById(req.params.id);
    if (!detail) return notFound(res, "Detalle de compra no encontrado");
    return ok(res, detail.toPublic());
  } catch (err) {
    console.error("[getPurchaseDetailById]", err);
    return serverError(res);
  }
};

// ── POST /api/compras/detalle-purchase ────────────────────────────────────────
const createPurchaseDetail = async (req, res) => {
  try {
    const { purchaseId, compraId, productoId, insumoId, nombre, cantidad, precioUnitario, subtotal } = req.body;

    const idCompra = compraId ?? purchaseId;
    if (!idCompra || cantidad === undefined || precioUnitario === undefined) {
      return badRequest(res, "Faltan campos requeridos: compraId, cantidad, precioUnitario");
    }

    const purchase = await purchaseRepo.findById(idCompra);
    if (!purchase) return notFound(res, "Compra no encontrada");

    if (purchase.estaAnulada()) {
      return badRequest(res, "No se pueden agregar detalles a una compra anulada");
    }

    const detail = await purchaseDetailRepo.create({
      compraId: idCompra,
      productoId: productoId ?? null,
      insumoId: insumoId ?? null,
      nombre: nombre ?? null,
      cantidad: parseFloat(cantidad),
      precioUnitario: parseFloat(precioUnitario),
      subtotal: subtotal !== undefined
        ? parseFloat(subtotal)
        : parseFloat(cantidad) * parseFloat(precioUnitario),
    });

    return created(res, detail.toPublic());
  } catch (err) {
    console.error("[createPurchaseDetail]", err);
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