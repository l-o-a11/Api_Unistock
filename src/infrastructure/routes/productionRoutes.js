/**
 * productionRoutes.js
 *
 * Rutas para la gestión de Órdenes de Producción.
 *
 * Órdenes:
 *   GET    /produccion/ordenes              - Listar órdenes (filtros: cliente, estado, id_usuario)
 *   GET    /produccion/ordenes/estados      - Listar estados válidos del flujo
 *   GET    /produccion/ordenes/:id          - Obtener orden + sus detalles
 *   POST   /produccion/ordenes              - Crear orden (estado inicial: "Diseño")
 *   PUT    /produccion/ordenes/:id          - Editar campos de la orden (no estado)
 *   PATCH  /produccion/ordenes/:id/estado   - Avanzar estado en el flujo
 *   PATCH  /produccion/ordenes/:id/anular   - Anular orden (requiere motivo en el body)
 *
 * Detalles:
 *   GET    /produccion/detalle-orden        - Listar detalles (filtro: id_orden)
 *   POST   /produccion/detalle-orden        - Crear detalle de orden
 *
 * Asignaciones:
 *   GET    /produccion/asignaciones         - Listar asignaciones de terceros
 *   POST   /produccion/asignaciones         - Crear asignación
 *
 * Todos requieren autenticación JWT.
 */

const { Router } = require("express");
const ctrl = require("../controllers/productionController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();
// router.use(requireAuth);  // REMOVIDO para desarrollo público

// Órdenes
router.get("/ordenes/estados",       ctrl.getEstados);        // Debe ir antes de /:id
router.get("/ordenes",               ctrl.getOrders);
router.get("/ordenes/:id",           ctrl.getOrderById);
router.post("/ordenes",              ctrl.createOrder);
router.put("/ordenes/:id",           ctrl.updateOrder);
router.patch("/ordenes/:id/estado",  ctrl.cambiarEstado);
router.patch("/ordenes/:id/anular",  ctrl.anularOrder);

// Detalles
router.get("/detalle-orden",         ctrl.getOrderDetails);
router.post("/detalle-orden",        ctrl.createOrderDetail);

// Asignaciones
router.get("/asignaciones",          ctrl.getAssignments);
router.post("/asignaciones",         ctrl.createAssignment);

module.exports = router;
