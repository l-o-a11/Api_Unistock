/**
 * purchaseController.js
 */

const PurchaseRepository = require("../repositories/PurchaseRepository");
const PurchaseDetailRepository = require("../repositories/PurchaseDetailRepository");
const SupplyRepository = require("../repositories/SupplyRepository");
const AnularPurchase = require("../../application/use-cases/purchases/AnularPurchase");
const CreatePurchase = require("../../application/use-cases/purchases/CreatePurchase");

const {
  ok, created, badRequest, notFound, conflict, unprocessable, serverError,
} = require("../../shared/utils/response");

const purchaseRepo = new PurchaseRepository();
const purchaseDetailRepo = new PurchaseDetailRepository();
const supplyRepo = new SupplyRepository();
const anularUC = new AnularPurchase(purchaseRepo);
const createUC = new CreatePurchase(purchaseRepo);

// ── GET /api/compras ──────────────────────────────────────────────────────────
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
const crearPurchase = async (req, res) => {
  try {
    const { detalles = [], ...purchaseData } = req.body;

    // Crear cabecera
    let purchase;
    try {
      purchase = await createUC.execute(purchaseData);
    } catch (err) {
      if (err.statusCode === 409) return conflict(res, err.message);
      if (err.statusCode === 422) return unprocessable(res, err.message);
      throw err;
    }

    // Crear detalles + sincronizar stock
    const detallesCreados = [];
    for (const d of detalles) {
      if (!d.cantidad || !d.precioUnitario) continue;

      const cantidad = parseFloat(d.cantidad);
      const subtotal = d.subtotal !== undefined
        ? parseFloat(d.subtotal)
        : cantidad * parseFloat(d.precioUnitario);

      // ── Stock: si el insumo existe → incrementar. Si es nuevo → crear. ──
      let insumoId = d.insumoId ?? null;

      if (insumoId) {
        // Insumo existente — sumar cantidad al stock actual (atómico con $inc)
        await supplyRepo.incrementStock(insumoId, cantidad);
      } else if (d.nombre) {
        // Insumo nuevo — crearlo con stock = cantidad comprada
        const nuevoInsumo = await supplyRepo.create({
          nombre: d.nombre,
          categoria: d.categoria ?? null,
          stock: cantidad,
          medida: d.medida ?? null,
          valor_medida: d.valor_medida ?? null,
          estado: true,
          propiedades: [],
        }).catch((err) => {
          // Si falla (categoria requerida, nombre duplicado, etc.)
          // NO interrumpimos la compra — solo logueamos
          console.error("[crearPurchase] No se pudo crear insumo automático:", err.message);
          return null;
        });

        if (nuevoInsumo) insumoId = nuevoInsumo.id;
      }

      const detalle = await purchaseDetailRepo.create({
        compraId: purchase.id,
        productoId: d.productoId ?? null,
        insumoId,
        nombre: d.nombre ?? null,
        cantidad,
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

    await purchaseDetailRepo.deleteByCompraId(req.params.id);
    await purchaseRepo.delete(req.params.id);

    return ok(res, { message: "Compra eliminada correctamente" });
  } catch (err) {
    console.error("[eliminarPurchase]", err);
    return serverError(res);
  }
};

// ── PATCH /api/compras/:id/anular ─────────────────────────────────────────────
// Al anular, se revierte el stock que la compra había sumado:
// por cada detalle con insumoId, se resta esa misma cantidad del inventario.
const anularPurchase = async (req, res) => {
  try {
    const { motivo } = req.body;

    // anularUC ya valida: existe, no está anulada, motivo no vacío
    const updated = await anularUC.execute(req.params.id, motivo);

    // ── Revertir stock ──────────────────────────────────────────────────
    // Solo se descuenta de insumos que SÍ están vinculados (insumoId presente).
    // Los detalles sin insumoId (insumo nuevo que falló al crearse) no tienen
    // nada que revertir porque tampoco sumaron stock en su momento.
    const detalles = await purchaseDetailRepo.findAll({ compraId: req.params.id });

    for (const d of detalles) {
      if (d.insumoId) {
        // incrementStock con cantidad negativa = decremento atómico
        await supplyRepo.incrementStock(d.insumoId, -d.cantidad).catch((err) => {
          // No interrumpir la anulación si un insumo puntual falla al revertir
          // (ej: el insumo fue eliminado después de la compra). Se loguea para
          // que el equipo revise manualmente ese caso.
          console.error(
            `[anularPurchase] No se pudo revertir stock del insumo ${d.insumoId}:`,
            err.message
          );
        });
      }
    }

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

    const cantidadNum = parseFloat(cantidad);

    // Incrementar stock si viene insumoId
    if (insumoId) {
      await supplyRepo.incrementStock(insumoId, cantidadNum);
    }

    const detail = await purchaseDetailRepo.create({
      compraId: idCompra,
      productoId: productoId ?? null,
      insumoId: insumoId ?? null,
      nombre: nombre ?? null,
      cantidad: cantidadNum,
      precioUnitario: parseFloat(precioUnitario),
      subtotal: subtotal !== undefined
        ? parseFloat(subtotal)
        : cantidadNum * parseFloat(precioUnitario),
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