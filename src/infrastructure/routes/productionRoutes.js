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
const validateSchema = require("../middlewares/validateSchema");
const { createOrderSchema, updateOrderSchema, cambiarEstadoSchema, anularOrderSchema } = require("../../shared/schemas/productionSchema");

const router = Router();
// router.use(requireAuth);  // REMOVIDO para desarrollo público

/**
 * @swagger
 * /produccion/ordenes/estados:
 *   get:
 *     summary: Listar todos los estados válidos para órdenes
 *     tags: [Producción]
 *     responses:
 *       200:
 *         description: Estados válidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items: { type: string }
 *                   example: ["Diseño", "Ficha Técnica", "Corte", "Compras", "Producción", "Recepción", "Enviado", "Anulada"]
 */

/**
 * @swagger
 * /produccion/ordenes:
 *   get:
 *     summary: Listar órdenes de producción
 *     tags: [Producción]
 *     parameters:
 *       - in: query
 *         name: cliente
 *         schema: { type: string }
 *       - in: query
 *         name: estado
 *         schema: { type: string }
 *       - in: query
 *         name: id_usuario
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de órdenes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ProductionOrder'
 *   post:
 *     summary: Crear nueva orden de producción
 *     tags: [Producción]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cliente, fecha_entrega]
 *             properties:
 *               cliente:
 *                 type: string
 *                 example: "Cliente ABC"
 *               fecha_entrega:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-06-30T15:00:00Z"
 *               asignaciones:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id_tercero: { type: string }
 *                     cantidad: { type: number }
 *     responses:
 *       201:
 *         description: Orden creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/ProductionOrder' }
 *       400:
 *         description: Error de validación
 */

/**
 * @swagger
 * /produccion/ordenes/{id}:
 *   get:
 *     summary: Obtener orden con detalles y asignaciones
 *     tags: [Producción]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Orden encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 data: { $ref: '#/components/schemas/ProductionOrder' }
 *       404:
 *         description: Orden no encontrada
 *   put:
 *     summary: Actualizar orden
 *     tags: [Producción]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente: { type: string }
 *               fecha_entrega: { type: string, format: date-time }
 *     responses:
 *       200:
 *         description: Orden actualizada
 *   patch:
 *     summary: Cambiar estado de la orden
 *     tags: [Producción]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [estado]
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: ["Diseño", "Ficha Técnica", "Corte", "Compras", "Producción", "Recepción", "Enviado"]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Transición de estado inválida
 */

/**
 * @swagger
 * /produccion/ordenes/{id}/anular:
 *   patch:
 *     summary: Anular una orden de producción
 *     tags: [Producción]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [motivo]
 *             properties:
 *               motivo:
 *                 type: string
 *                 example: "Cancelación del cliente"
 *     responses:
 *       200:
 *         description: Orden anulada
 *       400:
 *         description: No se puede anular esta orden
 */

/**
 * @swagger
 * /produccion/detalle-orden:
 *   get:
 *     summary: Listar detalles de órdenes
 *     tags: [Producción - Detalles]
 *     parameters:
 *       - in: query
 *         name: id_orden
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista de detalles
 *   post:
 *     summary: Crear detalle de orden
 *     tags: [Producción - Detalles]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_orden, id_producto, cantidad]
 *             properties:
 *               id_orden: { type: string }
 *               id_producto: { type: string }
 *               cantidad: { type: number, example: 50 }
 *               color: { type: string, example: "Rojo" }
 *     responses:
 *       201:
 *         description: Detalle creado
 *
 * /produccion/detalle-orden/{id}:
 *   put:
 *     summary: Actualizar detalle de orden
 *     tags: [Producción - Detalles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cantidad: { type: number }
 *               color: { type: string }
 *     responses:
 *       200:
 *         description: Detalle actualizado
 *   delete:
 *     summary: Eliminar detalle de orden
 *     tags: [Producción - Detalles]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Detalle eliminado
 */

/**
 * @swagger
 * /produccion/asignaciones:
 *   get:
 *     summary: Listar asignaciones de terceros
 *     tags: [Producción - Asignaciones]
 *     responses:
 *       200:
 *         description: Lista de asignaciones
 *   post:
 *     summary: Crear asignación de tercero
 *     tags: [Producción - Asignaciones]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [id_orden, id_tercero, cantidad]
 *             properties:
 *               id_orden: { type: string }
 *               id_tercero: { type: string }
 *               cantidad: { type: number, example: 100 }
 *     responses:
 *       201:
 *         description: Asignación creada
 */

// Órdenes
router.get("/ordenes/estados",       ctrl.getEstados);        // Debe ir antes de /:id
router.get("/ordenes",               ctrl.getOrders);
router.get("/ordenes/:id",           ctrl.getOrderById);
router.post("/ordenes",              validateSchema(createOrderSchema), ctrl.createOrder);
router.put("/ordenes/:id",           validateSchema(updateOrderSchema), ctrl.updateOrder);
router.patch("/ordenes/:id/estado",  validateSchema(cambiarEstadoSchema), ctrl.cambiarEstado);
router.patch("/ordenes/:id/anular",  validateSchema(anularOrderSchema), ctrl.anularOrder);

// Detalles
router.get("/detalle-orden",         ctrl.getOrderDetails);
router.post("/detalle-orden",        ctrl.createOrderDetail);
router.put("/detalle-orden/:id",     ctrl.updateOrderDetail);
router.delete("/detalle-orden/:id",  ctrl.deleteOrderDetail);

// Asignaciones
router.get("/asignaciones",               ctrl.getAssignments);
router.post("/asignaciones",              ctrl.createAssignment);
// ✅ DELETE para limpiar asignaciones antes de reasignar (evita sobre-suma)
router.delete("/asignaciones/:id",        ctrl.deleteAssignment);
router.delete("/asignaciones/orden/:id_orden", ctrl.deleteAssignmentsByOrder);

module.exports = router;
