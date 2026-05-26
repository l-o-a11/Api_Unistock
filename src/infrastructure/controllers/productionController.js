// infrastructure/controllers/productionController.js
const ProductionRepository            = require("../repositories/ProductionRepository");
const ProductionOrderDetailRepository = require("../repositories/ProductionOrderDetailRepository");
const ThirdPartyAssignmentRepository  = require("../repositories/ThirdPartyAssignmentRepository");
const AnularProduction                = require("../../application/use-cases/production/AnularProduction");
const CambiarEstadoProduction         = require("../../application/use-cases/production/CambiarEstadoProduction");
const Production                      = require("../../domain/entities/Production");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const prodRepo       = new ProductionRepository();
const detailRepo     = new ProductionOrderDetailRepository();
const assignmentRepo = new ThirdPartyAssignmentRepository();

// ── Órdenes ───────────────────────────────────────────────────────────────────

const getOrders = async (req, res) => {
  try {
    const orders = await prodRepo.findAll(req.query);
    return ok(res, orders.map((o) => o.toJSON()));
  } catch (err) {
    return serverError(res);
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");
    const details = await detailRepo.findAll({ id_orden: req.params.id });
    const assignments = await assignmentRepo.findAll({ id_orden: req.params.id });
    return ok(res, { 
      ...order.toJSON(), 
      detalles: details.map((d) => d.toJSON()),
      asignaciones: assignments.map((a) => a.toJSON ? a.toJSON() : a)
    });
  } catch (err) {
    return serverError(res);
  }
};

const createOrder = async (req, res) => {
  try {
    // Compatibilidad con payloads del frontend (sin tocar frontend)
    const fecha_entrega =
      req.body.fecha_entrega ?? req.body.deliveryDate ?? req.body.fechaSolicitud;
    const cliente = req.body.cliente ?? req.body.client;
    const id_usuario = req.body.id_usuario ?? req.body.userId;
    const asignaciones = req.body.asignaciones ?? [];

    // Usar id_usuario del body, o del middleware si está disponible, o "anonymous" si nada está disponible
    const userId = id_usuario || req.user?.id || "anonymous";
    
    if (!fecha_entrega || !cliente)
      return badRequest(res, "Los campos fecha_entrega y cliente son requeridos");

    const order = await prodRepo.create({
      fecha_entrega,
      cliente,
      id_usuario: userId,
      estado: "Diseño",
      historial: [{ estado: "Diseño", fecha: new Date(), id_usuario: userId, motivo: null }],
    });

    // Crear asignaciones si se proporcionan
    const createdAssignments = [];
    if (Array.isArray(asignaciones) && asignaciones.length > 0) {
      for (const asignacion of asignaciones) {
        try {
          const assignment = await assignmentRepo.create({
            id_orden: order.id || order._id,
            id_tercero: asignacion.id_tercero,
            cantidad: asignacion.cantidad,
          });
          createdAssignments.push(assignment.toJSON ? assignment.toJSON() : assignment);
        } catch (assignErr) {
          console.warn("Error creando asignación:", assignErr.message);
        }
      }
    }

    const orderData = order.toJSON();
    return created(res, { 
      ...orderData, 
      asignaciones: createdAssignments 
    });
  } catch (err) {
  console.error("Error al crear orden:", err);
  const msg = process.env.NODE_ENV === "production"
    ? "Error interno"
    : err.message;
  return serverError(res, msg);
}
};

const updateOrder = async (req, res) => {
  try {
    const order = await prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");

    if (order.estaAnulada())
      return badRequest(res, "No se puede editar una orden anulada");

    // No permitir cambiar estado ni historial directamente por este endpoint
    const { estado, historial, motivo_anulacion, ...safeChanges } = req.body;

    const updated = await prodRepo.update(req.params.id, safeChanges);
    return ok(res, updated.toJSON());
  } catch (err) {
    return serverError(res);
  }
};

// ── Anular orden (reemplaza deleteOrder) ─────────────────────────────────────

const anularOrder = async (req, res) => {
  try {
    const { motivo } = req.body;
    const id_usuario = req.user?.id || null;

    const useCase = new AnularProduction(prodRepo);
    const result  = await useCase.execute(req.params.id, motivo, id_usuario);
    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 400 || err.statusCode === 422)
      return badRequest(res, err.message);
    return serverError(res);
  }
};

// ── Cambiar estado ────────────────────────────────────────────────────────────

const cambiarEstado = async (req, res) => {
  try {
    const { estado } = req.body;
    const id_usuario = req.user?.id || null;

    const useCase = new CambiarEstadoProduction(prodRepo);
    const result  = await useCase.execute(req.params.id, estado, id_usuario);
    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 400 || err.statusCode === 422)
      return badRequest(res, err.message);
    return serverError(res);
  }
};

// ── Obtener estados válidos ───────────────────────────────────────────────────

const getEstados = (_req, res) => {
  return ok(res, Production.ESTADOS_VALIDOS);
};

// ── Detalles de orden ─────────────────────────────────────────────────────────

const getOrderDetails = async (req, res) => {
  try {
    const details = await detailRepo.findAll(req.query);
    return ok(res, details.map((d) => d.toJSON()));
  } catch (err) {
    return serverError(res);
  }
};

const createOrderDetail = async (req, res) => {
  try {
    const { id_orden, id_producto, cantidad, color } = req.body;
    if (!id_orden || !id_producto || !cantidad)
      return badRequest(res, "Los campos id_orden, id_producto y cantidad son requeridos");
    return created(res, await detailRepo.create({ id_orden, id_producto, cantidad, color, estado: true }));
  } catch (err) {
    return serverError(res);
  }
};

// ── Asignaciones ──────────────────────────────────────────────────────────────

const getAssignments = async (req, res) => {
  try {
    return ok(res, await assignmentRepo.findAll(req.query));
  } catch (err) {
    return serverError(res);
  }
};

const createAssignment = async (req, res) => {
  try {
    const { id_orden, id_tercero, cantidad } = req.body;
    if (!id_orden || !id_tercero || !cantidad)
      return badRequest(res, "Los campos id_orden, id_tercero y cantidad son requeridos");
    return created(res, await assignmentRepo.create({ id_orden, id_tercero, cantidad }));
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  anularOrder,
  cambiarEstado,
  getEstados,
  getOrderDetails,
  createOrderDetail,
  getAssignments,
  createAssignment,
};
