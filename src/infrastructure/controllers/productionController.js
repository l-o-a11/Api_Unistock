// infrastructure/controllers/productionController.js
const ProductionRepository            = require("../repositories/ProductionRepository");
const ProductionOrderDetailRepository = require("../repositories/ProductionOrderDetailRepository");
const ThirdPartyAssignmentRepository  = require("../repositories/ThirdPartyAssignmentRepository");
const ProductRepository                = require("../repositories/ProductRepository");
const TechnicalSpecificationsRepo      = require("../repositories/TechnicalSpecificationsRepository");
const MaterialTechnicalSpecificationsRepo = require("../repositories/MaterialTechnicalSpecificationsRepository");
const AnularProduction                = require("../../application/use-cases/production/AnularProduction");
const CambiarEstadoProduction         = require("../../application/use-cases/production/CambiarEstadoProduction");
const Production                      = require("../../domain/entities/Production");
const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const prodRepo       = new ProductionRepository();
const detailRepo     = new ProductionOrderDetailRepository();
const assignmentRepo = new ThirdPartyAssignmentRepository();
const productRepo    = new ProductRepository();
const techSpecRepo   = new TechnicalSpecificationsRepo();
const materialTechSpecRepo = new MaterialTechnicalSpecificationsRepo();

// ── Órdenes ───────────────────────────────────────────────────────────────────

const getOrders = async (req, res) => {
  try {
    const orders = await prodRepo.findAll(req.query);
    return ok(res, orders.map((o) => o.toJSON()));
  } catch (err) {
    console.error("Error en getOrders:", err);
    return serverError(res, process.env.NODE_ENV === "production" ? "Error interno" : err.message);
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");
    const details = await detailRepo.findAll({ id_orden: req.params.id });
    const assignments = await assignmentRepo.findAll({ id_orden: req.params.id });
    // Enriquecer detalles con producto y ficha técnica activa (si existe)
    const detallesEnriquecidos = await Promise.all(
      details.map(async (d) => {
        const det = d.toJSON ? d.toJSON() : d;
        let producto = null;
        // Intentar buscar por ObjectId
        producto = await productRepo.findById(det.id_producto).catch(() => null);
        // Si no existe, intentar buscar por referencia/código
        if (!producto) producto = await productRepo.findByReference(det.id_producto).catch(() => null);

        let ficha_tecnica = null;
        if (producto) {
          const specs = await techSpecRepo.findAll({ id_producto: producto.id });
          const activeSpec = specs && specs.length ? specs[0] : null;
          if (activeSpec) {
            const materiales = await materialTechSpecRepo.findAll({ id_producto: producto.id, id_ficha_tecnica: activeSpec.id });
            ficha_tecnica = {
              ...(activeSpec.toJSON ? activeSpec.toJSON() : activeSpec),
              materiales: materiales.map((m) => m.toJSON ? m.toJSON() : m),
            };
          }
        }

        return {
          ...det,
          producto: producto ? (producto.toJSON ? producto.toJSON() : producto) : null,
          ficha_tecnica,
        };
      })
    );

    return ok(res, {
      ...order.toJSON(),
      detalles: detallesEnriquecidos,
      asignaciones: assignments.map((a) => (a.toJSON ? a.toJSON() : a)),
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
    const tipo = req.body.tipo || req.body.type || 'produccion';
    const referencia = req.body.referencia || req.body.reference || null;
    const producto = req.body.producto || req.body.product || null;
    const designImages = Array.isArray(req.body.designImages) ? req.body.designImages : [];
    const fromDamaged = req.body.fromDamaged === true || req.body.fromDamaged === 'true';
    const originalOrderNumber = req.body.originalOrderNumber || req.body.original_order_number || null;
    const originalOrderStatus = req.body.originalOrderStatus || req.body.original_order_status || null;

    console.log(`[ProductionController] Creando orden tipo="${tipo}", cliente="${cliente}", ref="${referencia}"`);

    // Usar id_usuario del body, o del middleware si está disponible, o "anonymous" si nada está disponible
    const userId = id_usuario || req.user?.id || "anonymous";
    
    if (!fecha_entrega || !cliente) {
      console.warn(`[ProductionController] Validación fallida: fecha_entrega="${fecha_entrega}", cliente="${cliente}"`);
      return badRequest(res, "Los campos fecha_entrega y cliente son requeridos");
    }

    let techSpecification = req.body.techSpecification || req.body.techSheet || null;
    const isProduccion = tipo === 'produccion';

    console.log(`[ProductionController] techSpecification inicialmente: ${techSpecification ? 'presente' : 'null'}, isProduccion=${isProduccion}`);

    if (isProduccion && !techSpecification && referencia) {
      console.log(`[ProductionController] Buscando tech sheet para referencia="${referencia}"`);
      let product = null;
      product = await productRepo.findById(referencia).catch(() => null);
      if (!product) product = await productRepo.findByReference(referencia).catch(() => null);
      if (product) {
        const specs = await techSpecRepo.findAll({ id_producto: product.id });
        const activeSpec = specs && specs.length ? specs[0] : null;
        if (activeSpec) {
          const materiales = await materialTechSpecRepo.findAll({ id_producto: product.id, id_ficha_tecnica: activeSpec.id });
          techSpecification = {
            ...(activeSpec.toJSON ? activeSpec.toJSON() : activeSpec),
            materiales: materiales.map((m) => (m.toJSON ? m.toJSON() : m)),
          };
          console.log(`[ProductionController] Tech sheet encontrada para producto`);
        }
      }
    }

    const historial = isProduccion
      ? [
          { estado: "Diseño", fecha: new Date(), id_usuario: userId, motivo: null },
          { estado: "Ficha Técnica", fecha: new Date(), id_usuario: userId, motivo: null },
        ]
      : [
          { estado: "Diseño", fecha: new Date(), id_usuario: userId, motivo: null },
        ];

    console.log(`[ProductionController] Creando documento con historial de ${historial.length} estados`);

    const order = await prodRepo.create({
      fecha_entrega,
      cliente,
      id_usuario: userId,
      tipo,
      producto,
      referencia,
      techSpecification,
      designImages,
      fromDamaged,
      originalOrderNumber,
      originalOrderStatus,
      estado: isProduccion ? "Ficha Técnica" : "Diseño",
      historial,
    });

    console.log(`[ProductionController] Orden creada con ID: ${order.id || order._id}, numero_orden=${order.numero_orden}`);

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
    console.log(`[ProductionController] Orden convertida a JSON exitosamente`);
    return created(res, { 
      ...orderData, 
      asignaciones: createdAssignments 
    });
  } catch (err) {
    console.error("Error al crear orden:", err);
    console.error("Stack trace:", err.stack);
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

const updateOrderDetail = async (req, res) => {
  try {
    const detail = await detailRepo.findById(req.params.id);
    if (!detail) return notFound(res, "Detalle de orden no encontrado");

    const changes = {};
    if (req.body.cantidad !== undefined) changes.cantidad = Number(req.body.cantidad);
    if (req.body.color !== undefined) changes.color = String(req.body.color).trim();

    if (Object.keys(changes).length === 0)
      return badRequest(res, "No se proporcionaron cambios válidos para el detalle");

    const updatedDetail = await detailRepo.update(req.params.id, changes);
    return ok(res, updatedDetail.toJSON());
  } catch (err) {
    return serverError(res);
  }
};

const deleteOrderDetail = async (req, res) => {
  try {
    const deleted = await detailRepo.delete(req.params.id);
    if (!deleted) return notFound(res, "Detalle de orden no encontrado");
    return ok(res, { id: req.params.id, deleted: true });
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

    if (estado === "Producción") {
      const details = await detailRepo.findAll({ id_orden: req.params.id });
      const stockByProductId = new Map();

      await Promise.all(details.map(async (detail) => {
        const data = detail.toJSON ? detail.toJSON() : detail;
        const product =
          await productRepo.findById(data.id_producto).catch(() => null) ||
          await productRepo.findByReference(data.id_producto).catch(() => null);

        if (product?.id) {
          stockByProductId.set(
            product.id,
            (stockByProductId.get(product.id) || 0) + (Number(data.cantidad) || 0),
          );
        }
      }));

      await Promise.all(
        [...stockByProductId.entries()].map(([productId, stock]) =>
          productRepo.update(productId, { stock }),
        ),
      );
    }

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
  updateOrderDetail,
  deleteOrderDetail,
  anularOrder,
  cambiarEstado,
  getEstados,
  getOrderDetails,
  createOrderDetail,
  getAssignments,
  createAssignment,
};
