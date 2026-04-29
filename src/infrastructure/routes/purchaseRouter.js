/**
 * purchaseRouter.js
 * 
 * Define las rutas para la gestión de Compras.
 * 
 * Endpoints:
 * - GET    /purchases               - Listar compras
 * - GET    /purchases/:id           - Obtener compra
 * - POST   /purchases               - Crear compra
 * - PUT    /purchases/:id           - Actualizar compra
 * - DELETE /purchases/:id           - Eliminar compra
 * - GET    /purchases/detalle-purchase - Listar detalles de compra
 * - POST   /purchases/detalle-purchase - Crear detalle de compra
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
router.post('/', ctrl.crearPurchase);
router.get('/', ctrl.obtenerPurchases);
router.get('/:id', ctrl.obtenerPurchase);
router.put('/:id', ctrl.actualizarPurchase);
router.delete('/:id', ctrl.eliminarPurchase);

//detalle compra
router.get("/detalle-purchase", ctrl.getPurchaseDetail);
router.post("/detalle-purchase", ctrl.createPurchaseDetail);

module.exports = router;