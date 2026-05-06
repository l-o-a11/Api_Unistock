/**
 * purchaseRouter.js
 * 
 * Define las rutas para la gestión de Compras.
 * 
 * Endpoints:
 * - GET    /compras                        - Listar compras
 * - GET    /compras/:id                    - Obtener compra con sus detalles[]
 * - POST   /compras                        - Crear compra
 * - PUT    /compras/:id                    - Actualizar compra
 * - DELETE /compras/:id                    - Eliminar compra
 * - PATCH  /compras/:id/anular             - Anular/revertir compra (toggle anulada)
 * - GET    /compras/detalle-purchase       - Listar detalles de compra
 * - GET    /compras/detalle-purchase/:id   - Obtener detalle por ID
 * - POST   /compras/detalle-purchase       - Crear detalle de compra
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 */
const express = require('express');
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");
const router = express.Router();
const ctrl = require('../controllers/purchaseController');
// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);

// ── Rutas de detalle (deben ir ANTES de /:id para no ser capturadas por ese parámetro)
router.get("/detalle-purchase",      ctrl.getPurchaseDetail);
router.get("/detalle-purchase/:id",  ctrl.getPurchaseDetailById);
router.post("/detalle-purchase",     ctrl.createPurchaseDetail);

// ── Compras CRUD
router.post('/',         ctrl.crearPurchase);
router.get('/',          ctrl.obtenerPurchases);
router.get('/:id',       ctrl.obtenerPurchase);
router.put('/:id',       ctrl.actualizarPurchase);
router.delete('/:id',    ctrl.eliminarPurchase);

// ── Anular compra (toggle anulada)
router.patch('/:id/anular', ctrl.anularPurchase);

module.exports = router;