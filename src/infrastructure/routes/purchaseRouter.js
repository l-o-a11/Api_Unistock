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
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");
const ctrl = require("../controllers/purchaseController");

const router = express.Router();
const MODULO = "compras";

router.use(requireAuth);

// ── Detalles (ANTES de /:id para evitar captura por ese parámetro) ─────────
router.get("/detalle-purchase", requirePermission(MODULO, "leer"), ctrl.getPurchaseDetail);
router.get("/detalle-purchase/:id", requirePermission(MODULO, "leer"), ctrl.getPurchaseDetailById);
router.post("/detalle-purchase", requirePermission(MODULO, "crear"), ctrl.createPurchaseDetail);

// ── Compras CRUD ───────────────────────────────────────────────────────────
router.post("/", requirePermission(MODULO, "crear"), ctrl.crearPurchase);
router.get("/", requirePermission(MODULO, "leer"), ctrl.obtenerPurchases);
router.get("/:id", requirePermission(MODULO, "leer"), ctrl.obtenerPurchase);
router.put("/:id", requirePermission(MODULO, "actualizar"), ctrl.actualizarPurchase);
router.delete("/:id", requirePermission(MODULO, "eliminar"), ctrl.eliminarPurchase);

// ── Anulación ──────────────────────────────────────────────────────────────
router.patch("/:id/anular", requirePermission(MODULO, "actualizar"), ctrl.anularPurchase);

module.exports = router;