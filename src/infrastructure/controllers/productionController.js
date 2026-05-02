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
    return ok(res, { ...order.toJSON(), detalles: details });
  } catch (err) {
    return serverError(res);
  }
};

const createOrder = async (req, res) => {
  try {
    const { fecha_entrega, cliente, id_usuario } = req.body;
    if (!fecha_entrega || !cliente || !id_usuario)
      return badRequest(res, "Los campos fecha_entrega, cliente e id_usuario son requeridos");

    const order = await prodRepo.create({
      fecha_entrega,
      cliente,
      id_usuario,
      estado: "Diseño",
      historial: [{ estado: "Diseño", fecha: new Date(), id_usuario, motivo: null }],
    });
    return created(res, order.toJSON());
  } catch (err) {
    return serverError(res);
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
    return ok(res, await detailRepo.findAll(req.query));
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
