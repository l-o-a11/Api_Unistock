/**
 * compraRouter.js
 * 
 * Define las rutas para la gestión de Compras.
 * 
 * Endpoints:
 * - GET    /compras               - Listar compras
 * - GET    /compras/:id           - Obtener compra
 * - POST   /compras               - Crear compra
 * - PUT    /compras/:id           - Actualizar compra
 * - DELETE /compras/:id           - Eliminar compra
 * - GET    /compras/detalle-compra - Listar detalles de compra
 * - POST   /compras/detalle-compra - Crear detalle de compra
 * 
 * Todos requieren autenticación (JWT token)
 * 
 * @author Unistock Team
 */
const express = require('express');
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");
const router = express.Router();
const ctrl = require('../controllers/compra.controller');
// Middleware: Requerir autenticación en todos los endpoints
router.use(requireAuth);
router.post('/', ctrl.crearCompra);
router.get('/', ctrl.obtenerCompras);
router.get('/:id', ctrl.obtenerCompra);
router.put('/:id', ctrl.actualizarCompra);
router.delete('/:id', ctrl.eliminarCompra);

//detalle compra
router.get("/detalle-compra", ctrl.getCompraDetail);
router.post("/detalle-compra", ctrl.createCompraDetail);

module.exports = router;