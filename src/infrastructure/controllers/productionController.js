// infrastructure/controllers/productionController.js
const ProductionRepository = require("../repositories/ProductionRepository");
const ProductionOrderDetailRepository = require("../repositories/ProductionOrderDetailRepository");
const ThirdPartyAssignmentRepository = require("../repositories/ThirdPartyAssignmentRepository");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const prodRepo       = new ProductionRepository();
const detailRepo     = new ProductionOrderDetailRepository();
const assignmentRepo = new ThirdPartyAssignmentRepository();

const getOrders = async (req, res) => {
  try { return ok(res, await prodRepo.findAll(req.query)); }
  catch (err) { return serverError(res); }
};

const getOrderById = async (req, res) => {
  try {
    const order = await prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");
    const details = await detailRepo.findAll({ id_orden: req.params.id });
    return ok(res, { ...order.toJSON(), detalles: details });
  } catch (err) { return serverError(res); }
};

const createOrder = async (req, res) => {
  try {
    const { fecha_entrega, cliente, id_usuario } = req.body;
    if (!fecha_entrega || !cliente || !id_usuario)
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    return created(res, await prodRepo.create({ fecha_entrega, cliente, id_usuario }));
  } catch (err) { return serverError(res); }
};

const updateOrder = async (req, res) => {
  try {
    const order = await prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");
    return ok(res, await prodRepo.update(req.params.id, req.body));
  } catch (err) { return serverError(res); }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");
    await prodRepo.delete(req.params.id);
    return ok(res, { message: "Orden eliminada exitosamente" });
  } catch (err) { return serverError(res); }
};

const getOrderDetails = async (req, res) => {
  try { return ok(res, await detailRepo.findAll(req.query)); }
  catch (err) { return serverError(res); }
};

const createOrderDetail = async (req, res) => {
  try {
    const { id_orden, id_producto, cantidad, color } = req.body;
    if (!id_orden || !id_producto || !cantidad)
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    return created(res, await detailRepo.create({ id_orden, id_producto, cantidad, color, estado: true }));
  } catch (err) { return serverError(res); }
};

const getAssignments = async (req, res) => {
  try { return ok(res, await assignmentRepo.findAll(req.query)); }
  catch (err) { return serverError(res); }
};

const createAssignment = async (req, res) => {
  try {
    const { id_orden, id_tercero, cantidad } = req.body;
    if (!id_orden || !id_tercero || !cantidad)
      return badRequest(res, "Todos los campos requeridos deben ser proporcionados");
    return created(res, await assignmentRepo.create({ id_orden, id_tercero, cantidad }));
  } catch (err) { return serverError(res); }
};

module.exports = { getOrders, getOrderById, createOrder, updateOrder, deleteOrder, getOrderDetails, createOrderDetail, getAssignments, createAssignment };
