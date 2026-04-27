/**
 * productionRoutes.js
 * 
 * Define las rutas para la gestión de Órdenes de Producción.
 * 
 * Rutas Principales:
 * - /ordenes              - Órdenes de producción CRUD
 * - /detalle-orden        - Detalles de órdenes
 * - /asignaciones         - Asignación de terceros a órdenes
 * 
 * Todos requieren autenticación JWT
 * 
 * @author Unistock Team
 */

const { Router } = require("express");
const ctrl = require("../controllers/productionController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();

router.use(requireAuth);

// Production Orders
router.get("/ordenes", ctrl.getOrders);
router.get("/ordenes/:id", ctrl.getOrderById);
router.post("/ordenes", ctrl.createOrder);
router.put("/ordenes/:id", ctrl.updateOrder);
router.delete("/ordenes/:id", ctrl.deleteOrder);

// Order Details
router.get("/detalle-orden", ctrl.getOrderDetails);
router.post("/detalle-orden", ctrl.createOrderDetail);

// Third Party Assignments
router.get("/asignaciones", ctrl.getAssignments);
router.post("/asignaciones", ctrl.createAssignment);

module.exports = router;
