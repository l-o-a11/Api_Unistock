/**
 * productionController.js
 * 
 * Controlador para la gestión de Órdenes de Producción.
 * Maneja:
 * - Órdenes de Producción (Production Orders)
 * - Detalles de Órdenes (Order Details)
 * - Asignaciones de Terceros (Third Party Assignments)
 * 
 * @author Unistock Team
 * @version 1.0.0
 */

const ProductionRepository = require("../repositories/ProductionRepository");
const ProductionOrderDetailRepository = require("../repositories/ProductionOrderDetailRepository");
const ThirdPartyAssignmentRepository = require("../repositories/ThirdPartyAssignmentRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const prodRepo = new ProductionRepository();
const detailRepo = new ProductionOrderDetailRepository();
const assignmentRepo = new ThirdPartyAssignmentRepository();

const getOrders = (req, res) => {
  try {
    const orders = prodRepo.findAll(req.query);
    return ok(res, orders);
  } catch (err) {
    return serverError(res);
  }
};

const getOrderById = (req, res) => {
  try {
    const order = prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");
    const details = detailRepo.findAll({ id_orden: req.params.id });
    return ok(res, { ...order, detalles: details });
  } catch (err) {
    return serverError(res);
  }
};

const createOrder = (req, res) => {
  try {
    const { fecha_entrega, cliente, id_usuario } = req.body;
    if (!fecha_entrega || !cliente || !id_usuario) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const order = prodRepo.create({
      fecha_entrega,
      cliente,
      id_usuario,
    });
    return created(res, order);
  } catch (err) {
    return serverError(res);
  }
};

const updateOrder = (req, res) => {
  try {
    const order = prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");
    const updated = prodRepo.update(req.params.id, req.body);
    return ok(res, updated);
  } catch (err) {
    return serverError(res);
  }
};

const deleteOrder = (req, res) => {
  try {
    const order = prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");
    prodRepo.delete(req.params.id);
    return ok(res, { message: "Orden eliminada exitosamente" });
  } catch (err) {
    return serverError(res);
  }
};

const getOrderDetails = (req, res) => {
  try {
    const details = detailRepo.findAll(req.query);
    return ok(res, details);
  } catch (err) {
    return serverError(res);
  }
};

const createOrderDetail = (req, res) => {
  try {
    const { id_orden, id_producto, cantidad, color } = req.body;
    if (!id_orden || !id_producto || !cantidad) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const detail = detailRepo.create({
      id_orden,
      id_producto,
      cantidad,
      color,
      estado: true,
    });
    return created(res, detail);
  } catch (err) {
    return serverError(res);
  }
};

const getAssignments = (req, res) => {
  try {
    const assignments = assignmentRepo.findAll(req.query);
    return ok(res, assignments);
  } catch (err) {
    return serverError(res);
  }
};

const createAssignment = (req, res) => {
  try {
    const { id_orden, id_tercero, cantidad } = req.body;
    if (!id_orden || !id_tercero || !cantidad) {
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    }
    const assignment = assignmentRepo.create({
      id_orden,
      id_tercero,
      cantidad,
    });
    return created(res, assignment);
  } catch (err) {
    return serverError(res);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  getOrderDetails,
  createOrderDetail,
  getAssignments,
  createAssignment,
};
