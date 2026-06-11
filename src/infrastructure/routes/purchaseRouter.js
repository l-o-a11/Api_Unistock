/**
 * purchaseRouter.js
 *
 * Rutas para la gestión de Compras.
 *
 * Endpoints:
 * GET    /api/compras                          - Listar compras (filtros: anulada, proveedorId, numeroFactura)
 * GET    /api/compras/detalle-purchase         - Listar detalles (filtro: compraId)
 * GET    /api/compras/detalle-purchase/:id     - Obtener detalle por ID
 * POST   /api/compras/detalle-purchase         - Crear detalle suelto
 * POST   /api/compras                          - Crear compra + detalles (atómico)
 * GET    /api/compras/:id                      - Obtener compra con detalles[]
 * PUT    /api/compras/:id                      - Actualizar cabecera compra
 * DELETE /api/compras/:id                      - Eliminar compra y sus detalles
 * PATCH  /api/compras/:id/anular               - Anular compra (body: { motivo })
 *
 * Todos requieren autenticación JWT.
 */

const express = require("express");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");
const ctrl = require("../controllers/purchaseController");

const router = express.Router();

router.use(requireAuth);

// ── Detalles (ANTES de /:id para evitar captura por ese parámetro) ─────────
router.get("/detalle-purchase", ctrl.getPurchaseDetail);
router.get("/detalle-purchase/:id", ctrl.getPurchaseDetailById);
router.post("/detalle-purchase", ctrl.createPurchaseDetail);

// ── Compras CRUD ───────────────────────────────────────────────────────────
router.post("/", ctrl.crearPurchase);
router.get("/", ctrl.obtenerPurchases);
router.get("/:id", ctrl.obtenerPurchase);
router.put("/:id", ctrl.actualizarPurchase);
router.delete("/:id", ctrl.eliminarPurchase);

// ── Anulación ──────────────────────────────────────────────────────────────
router.patch("/:id/anular", ctrl.anularPurchase);

module.exports = router;