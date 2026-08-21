// ─────────────────────────────────────────────────────────────────────────────
// src/infrastructure/controllers/productionController.js
// ─────────────────────────────────────────────────────────────────────────────

const mongoose = require("mongoose");

const ProductionRepository            = require("../repositories/ProductionRepository");
const ProductionOrderDetailRepository = require("../repositories/ProductionOrderDetailRepository");
const ThirdPartyAssignmentRepository  = require("../repositories/ThirdPartyAssignmentRepository");
const ProductRepository               = require("../repositories/ProductRepository");
const TechnicalSheetRepository        = require("../repositories/TechnicalSpecificationsRepository");
// ✅ Carga laboral de empleados (asignación de responsable en Corte/Compras/Recepción).
// UserModel aquí es el modelo "mínimo" de solo lectura — el CRUD real vive en Api_Unistock,
// pero ambos backends apuntan a la misma base de datos "unistock".
const UserModel          = require("../db/UserModel");
const ProductionOrderModel = require("../db/ProductionOrderModel");

const AnularProduction       = require("../../application/use-cases/production/AnularProduction");
const CambiarEstadoProduction = require("../../application/use-cases/production/CambiarEstadoProduction");
const CreateOrderDetail      = require("../../application/use-cases/production/CreateOrderDetail");
const GetOrderDetails        = require("../../application/use-cases/production/GetOrderDetails");

const Production = require("../../domain/entities/Production");
const GetCalendarioProduction = require("../../application/use-cases/production/GetCalendarioProduction");
const GetAlertasProduction    = require("../../application/use-cases/production/GetAlertasProduction");
const GetProductions          = require("../../application/use-cases/production/GetProductions");
const AsignarEmpleadoProduccion  = require("../../application/use-cases/production/AsignarEmpleadoProduccion");
const ReasignarEmpleadoProduccion = require("../../application/use-cases/production/ReasignarEmpleadoProduccion");
const ConfirmarEtapaProduccion   = require("../../application/use-cases/production/ConfirmarEtapaProduccion");
const UserRepository             = require("../repositories/UserRepository");

const { ok, created, badRequest, notFound, serverError } = require("../../shared/utils/response");

const prodRepo       = new ProductionRepository();
const detailRepo     = new ProductionOrderDetailRepository();
const assignmentRepo = new ThirdPartyAssignmentRepository();
const productRepo    = new ProductRepository();
const techSheetRepo  = new TechnicalSheetRepository();

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Devuelve serverError con el mensaje real en desarrollo,
 * y genérico en producción.
 */
const handleError = (res, err) => {
  console.error("[ProductionController]", err);
  const msg = process.env.NODE_ENV !== "production" ? err.message : undefined;
  return serverError(res, msg);
};

/**
 * Al pasar una orden a "Enviado", se suman las cantidades de cada detalle
 * (agrupadas por id_producto) al stock del producto correspondiente
 * (los detalles guardan id_producto = referencia del producto, no el _id).
 */
const aplicarIngresoStockPorEnvio = async (idOrden) => {
  try {
    const detalles = await detailRepo.findAll({ id_orden: idOrden });
    if (!detalles?.length) return;

    // Agrupar cantidades por referencia de producto (puede haber varios colores)
    const cantidadPorReferencia = new Map();
    for (const d of detalles) {
      const ref = d.id_producto;
      if (!ref) continue;
      cantidadPorReferencia.set(ref, (cantidadPorReferencia.get(ref) || 0) + Number(d.cantidad || 0));
    }

    for (const [referencia, cantidad] of cantidadPorReferencia.entries()) {
      if (!cantidad) continue;
      const product = await productRepo.findByReference(referencia).catch(() => null);
      if (!product) {
        console.warn(`[ProductionController] No se encontró producto con referencia "${referencia}" para sumar stock`);
        continue;
      }
      // Suma atómica: toma el stock que el producto tenga en ese momento y le agrega la cantidad enviada
      await productRepo.incrementStock(product.id, cantidad);
    }
  } catch (err) {
    console.error("[ProductionController] Error al actualizar stock por envío:", err);
  }
};

// ── Órdenes ───────────────────────────────────────────────────────────────────

const getOrders = async (req, res) => {
  try {
    const result = await prodRepo.findAll(req.query);
    const orders = Array.isArray(result?.data) ? result.data : [];
    const mappedOrders = orders.map((o) => o.toJSON?.() || o);
    return ok(res, {
      data: mappedOrders,
      total: result.total || 0,
      page: result.page || 1,
      limit: result.limit || mappedOrders.length,
      totalPages: result.totalPages || 0,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");
    const details = await detailRepo.findAll({ id_orden: req.params.id });
    return ok(res, { ...order.toJSON(), detalles: details.map((d) => d.toJSON()) });
  } catch (err) {
    return handleError(res, err);
  }
};

const createOrder = async (req, res) => {
  try {
    const { fecha_entrega, cliente, id_usuario } = req.body;
    const userId = id_usuario || req.user?.id || "anonymous";

    if (!fecha_entrega || !cliente)
      return badRequest(res, "Los campos fecha_entrega y cliente son requeridos");

    // 🐛 FIX: este createOrder ignoraba por completo el campo "tipo" que
    // manda el frontend y SIEMPRE creaba la orden en estado "Diseño" —
    // incluso las de tipo "produccion" (artículo con ficha técnica YA
    // EXISTENTE, elegido de un producto del catálogo), que deben arrancar
    // directamente en "Ficha Técnica" (el "Diseño" se da por completado
    // automáticamente porque ya existe) para que el flujo respete el orden
    // real de las etapas: Diseño → Ficha Técnica → Corte → ... En Api/src
    // (puerto 3000) esta lógica ya existía correctamente; aquí faltaba.
    const tipo = req.body.tipo || req.body.type || "produccion";
    const referencia = req.body.referencia || req.body.reference || null;
    const producto = req.body.producto || req.body.product || null;
    const designImages = Array.isArray(req.body.designImages) ? req.body.designImages : [];
    const fromDamaged = req.body.fromDamaged === true || req.body.fromDamaged === "true";
    const originalOrderNumber = req.body.originalOrderNumber || req.body.original_order_number || null;
    const originalOrderStatus = req.body.originalOrderStatus || req.body.original_order_status || null;

    let techSpecification = req.body.techSpecification || req.body.techSheet || null;
    const isProduccion = tipo === "produccion";

    // Las órdenes tipo "produccion" referencian un producto que YA tiene
    // ficha técnica registrada — se busca y se copia dentro de la orden
    // para que quede disponible de inmediato en la etapa "Ficha Técnica".
    if (isProduccion && !techSpecification && referencia) {
      let product = null;
      const refTrimmed = String(referencia).trim();
      if (mongoose.isValidObjectId(refTrimmed)) {
        product = await productRepo.findById(refTrimmed).catch(() => null);
      }
      if (!product) product = await productRepo.findByReference(refTrimmed).catch(() => null);
      if (!product && refTrimmed !== referencia) {
        product = await productRepo.findByReference(referencia).catch(() => null);
      }
      if (product) {
        const specs = await techSheetRepo.findAll({ id_producto: product.id }).catch(() => []);
        const activeSpec = specs && specs.length ? specs[0] : null;
        if (activeSpec) techSpecification = activeSpec;
      }
    }

    const estadoInicial = isProduccion ? "Ficha Técnica" : "Diseño";

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
      estado: estadoInicial,
      // "Diseño" se registra como paso automático completado cuando la
      // orden arranca directo en "Ficha Técnica" (tipo producción), igual
      // que hace Api/src, para que el historial/stepper no muestre un
      // salto de etapa.
      historial: [{ estado: "Diseño", fecha: new Date(), id_usuario: userId, motivo: null }],
    });
    return created(res, order.toJSON());
  } catch (err) {
    return handleError(res, err);
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");

    if (order.estaAnulada())
      return badRequest(res, "No se puede editar una orden anulada");

    const { estado, historial, motivo_anulacion, ...rest } = req.body;

    const ALLOWED_FIELDS = new Set([
      "cliente",
      "fecha_entrega",
      "id_usuario",
      "asignaciones",
      "empleadoAsignaciones",
      "tipo",
      "referencia",
      "producto",
      "techSpecification",
      "designImages",
      "finishedImages",
      "finishedImageUrl",
      "fromDamaged",
      "originalOrderNumber",
      "originalOrderStatus",
    ]);

    const safeChanges = {};
    for (const [key, value] of Object.entries(rest)) {
      if (ALLOWED_FIELDS.has(key) && value !== undefined) {
        safeChanges[key] = value;
      }
    }

    if (Object.prototype.hasOwnProperty.call(safeChanges, "cliente")) {
      const cliente = typeof safeChanges.cliente === "string" ? safeChanges.cliente.trim() : safeChanges.cliente;
      if (!cliente) return badRequest(res, "El cliente no puede estar vacío");
      safeChanges.cliente = cliente;
    }

    if (Object.prototype.hasOwnProperty.call(safeChanges, "fecha_entrega")) {
      const fecha = new Date(safeChanges.fecha_entrega);
      if (!safeChanges.fecha_entrega || Number.isNaN(fecha.getTime())) {
        return badRequest(res, "La fecha de entrega no es válida");
      }
      safeChanges.fecha_entrega = fecha;
    }

    const updated = await prodRepo.update(req.params.id, safeChanges);
    if (!updated) return serverError(res, "Error al actualizar la orden");
    return ok(res, updated.toJSON());
  } catch (err) {
    if (err.name === "ValidationError" || err.name === "CastError") {
      return badRequest(res, err.message);
    }
    return handleError(res, err);
  }
};

// ── Anular orden ──────────────────────────────────────────────────────────────

const anularOrder = async (req, res) => {
  try {
    const { motivo, id_usuario: bodyUser, user: bodyUserName } = req.body;
    const id_usuario = bodyUser || req.user?.id || null;
    const user = bodyUserName || req.user?.nombre || req.user?.id || (typeof bodyUser === 'string' ? bodyUser : null);

    const useCase = new AnularProduction(prodRepo);
    const result  = await useCase.execute(req.params.id, motivo, id_usuario, user);
    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 400 || err.statusCode === 422) return badRequest(res, err.message);
    return handleError(res, err);
  }
};

// ── Cambiar estado ────────────────────────────────────────────────────────────

const cambiarEstado = async (req, res) => {
  try {
    const { estado, id_usuario: bodyUser, user: bodyUserName, force, ...rest } = req.body;
    const id_usuario = bodyUser || req.user?.id || null;
    const user = bodyUserName || req.user?.nombre || req.user?.id || (typeof bodyUser === 'string' ? bodyUser : null);
    console.log(`[ProductionController] cambiarEstado called id=${req.params.id} estado=${estado} id_usuario=${id_usuario} force=${!!force}`);
    console.log('[ProductionController] payload extra:', rest);

    // Si retrocedemos a un estado igual o anterior a "Compras", eliminamos las asignaciones de terceros de la orden
    const Production = require("../../domain/entities/Production");
    const targetIdx = Production.ESTADOS_VALIDOS.indexOf(estado);
    const comprasIdx = Production.ESTADOS_VALIDOS.indexOf("Compras");
    if (targetIdx !== -1 && targetIdx <= comprasIdx) {
      console.log(`[ProductionController] Retrocediendo al estado "${estado}". Eliminando asignaciones para orden ${req.params.id}`);
      await assignmentRepo.deleteByOrder(req.params.id);
    }

    const useCase = new CambiarEstadoProduction(prodRepo, new UserRepository());
    const result  = await useCase.execute(req.params.id, estado, id_usuario, user, {
      force: !!force, extra: rest,
      solicitante: req.user
        ? { id: req.user.id || req.user._id, rolNombre: req.user.rolNombre }
        : null,
    });
      console.log('[ProductionController] cambiarEstado result:', result && result.id ? result.id : result);

    // Al confirmar el envío, los productos fabricados ingresan al stock
    if (estado === "Enviado") {
      await aplicarIngresoStockPorEnvio(req.params.id);
    }

    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 400 || err.statusCode === 422) return badRequest(res, err.message);
    return handleError(res, err);
  }
};

// ── Obtener estados válidos ───────────────────────────────────────────────────

const getEstados = (_req, res) => {
  return ok(res, Production.ESTADOS_VALIDOS);
};

// ── Detalles de orden ─────────────────────────────────────────────────────────

const getOrderDetails = async (req, res) => {
  try {
    const useCase = new GetOrderDetails(detailRepo);
    return ok(res, await useCase.execute(req.query));
  } catch (err) {
    return handleError(res, err);
  }
};

const createOrderDetail = async (req, res) => {
  try {
    // Parsear cantidad a número por si llega como string desde el form
    const payload = {
      ...req.body,
      cantidad: req.body.cantidad !== undefined ? Number(req.body.cantidad) : undefined,
    };

    const useCase = new CreateOrderDetail(detailRepo, prodRepo);
    const detail  = await useCase.execute(payload);

    // ✅ Si la orden ya está en etapa "Corte", asignar refCorte automáticamente
    // al nuevo detalle — mismo mecanismo que al avanzar el estado a Corte.
    if (!detail.refCorte) {
      const order = await prodRepo.findById(payload.id_orden).catch(() => null);
      if (order && order.estado === 'Corte') {
        try {
          const siguiente = (await detailRepo.countRefCorteByProducto(payload.id_producto)) + 1;
          const refCorte  = `${payload.id_producto}-${siguiente}`;
          await detailRepo.update(detail.id, { refCorte });
          const updated = await detailRepo.findById(detail.id);
          return created(res, updated);
        } catch (e) {
          console.warn('No se pudo asignar refCorte automáticamente:', e?.message);
        }
      }
    }

    return created(res, detail);
  } catch (err) {
    if (err.statusCode === 400)  return badRequest(res, err.message);
    if (err.statusCode === 404)  return notFound(res, err.message);
    if (err.statusCode === 422)  return badRequest(res, err.message);
    return handleError(res, err);
  }
};

// ── DELETE /produccion/detalle-orden/:id ──────────────────────────────────────
// Elimina un detalle de orden y registra la acción en el historial de la orden.
const deleteOrderDetail = async (req, res) => {
  try {
    const detail = await detailRepo.findById(req.params.id);
    if (!detail) return notFound(res, 'Detalle no encontrado');

    const deleted = await detailRepo.delete(req.params.id);
    if (!deleted) return notFound(res, 'No se pudo eliminar el detalle');

// Registrar en el historial de la orden
    const userId   = req.user?.id || req.user?._id || null;
    const userName = req.user?.nombreCompleto || req.user?.nombre || req.user?.username || 'Sistema';
    await prodRepo.agregarHistorial(
      detail.id_orden,
      `Artículo ${detail.id_producto} (${detail.color || 'sin color'}, ${detail.cantidad} uds) eliminado`,
      userId,
      userName,
      'Referencia eliminada',
    ).catch(() => { /* no bloquear si el push falla */ });

    return ok(res, { deleted: true });
  } catch (err) {
    return handleError(res, err);
  }
};

const getAssignments = async (req, res) => {
  try {
    return ok(res, await assignmentRepo.findAll(req.query));
  } catch (err) {
    return handleError(res, err);
  }
};

const createAssignment = async (req, res) => {
  try {
    const { id_orden, id_tercero, cantidad } = req.body;
    if (!id_orden || !id_tercero || !cantidad)
      return badRequest(res, "Los campos id_orden, id_tercero y cantidad son requeridos");
    return created(res, await assignmentRepo.create({ id_orden, id_tercero, cantidad }));
  } catch (err) {
    return handleError(res, err);
  }
};


// ── Carga laboral de empleados (para asignar responsable en Corte/Compras/Recepción) ──

// Estados que ya no cuentan como "carga activa" para un empleado
const ESTADOS_FINALIZADOS = ["Enviado", "Anulada"];

/**
 * GET /produccion/empleados/carga
 * Devuelve los usuarios activos junto con la cantidad de órdenes de producción
 * activas (no Enviado/Anulada) en las que están asignados como responsables
 * de la etapa ACTUAL (empleadoAsignadoId), para poder repartir
 * la carga de trabajo al asignar un nuevo responsable.
 *
 * 🐛 FIX: antes contaba desde `empleadoAsignaciones` (objeto que acumula
 * TODAS las asignaciones históricas del empleado por etapa), lo cual podía
 * inflar el conteo o mostrar 0 si el empleado solo estaba asignado en la
 * etapa actual. Ahora cuenta desde `empleadoAsignadoId` (el empleado
 * responsable de la etapa ACTUAL de la orden), que es el campo que realmente
 * refleja la carga de trabajo actual del empleado.
 */
const getEmployeeWorkload = async (req, res) => {
  try {
    const cargo = typeof req.query.cargo === "string" ? req.query.cargo.trim() : "";
    const sedeId = typeof req.query.sedeId === "string" ? req.query.sedeId.trim() : "";
    const employeeFilter = { estado: true };

    if (cargo) employeeFilter.cargo = { $regex: `^${cargo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
    if (sedeId && mongoose.isValidObjectId(sedeId)) employeeFilter.sedeId = sedeId;

    const employees = await UserModel.find(employeeFilter)
      .select("_id nombre nombreCompleto correo cargo sedeId")
      .sort({ nombreCompleto: 1, nombre: 1 })
      .lean();

    // 🐛 FIX: contar desde `empleadoAsignadoId` (campo plano) en vez de
    // `empleadoAsignaciones` (objeto con todas las etapas históricas).
    // Así el conteo refleja la carga REAL del empleado en la etapa actual.
    const activeOrders = await ProductionOrderModel.find(
      { estado: { $nin: ESTADOS_FINALIZADOS } },
      { empleadoAsignadoId: 1 },
    ).lean();

    const countByEmployeeId = new Map();
    for (const order of activeOrders) {
      const idEmpleado = order.empleadoAsignadoId;
      if (idEmpleado) {
        const key = String(idEmpleado);
        countByEmployeeId.set(key, (countByEmployeeId.get(key) || 0) + 1);
      }
    }

    const result = employees.map((u) => ({
      id: String(u._id),
      nombre: u.nombreCompleto || u.nombre,
      correo: u.correo,
      cargo: u.cargo,
      sedeId: u.sedeId ? String(u.sedeId) : null,
      produccionesAsignadas: countByEmployeeId.get(String(u._id)) || 0,
    }));

    return ok(res, result);
  } catch (err) {
    return handleError(res, err);
  }
};

// ── Calendario ────────────────────────────────────────────────────────────────

const getCalendario = async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    const useCase = new GetCalendarioProduction(prodRepo);
    const result  = await useCase.execute(desde, hasta);
    return ok(res, result);
  } catch (err) {
    return handleError(res, err);
  }
};

// ── Alertas ───────────────────────────────────────────────────────────────────

const getAlertas = async (req, res) => {
  try {
    const useCase = new GetAlertasProduction(prodRepo);
    const result  = await useCase.execute();
    return ok(res, result);
  } catch (err) {
    return handleError(res, err);
  }
};

// ── Asignar empleado a etapa actual ──────────────────────────────────────────

const asignarEmpleado = async (req, res) => {
  try {
    const empleadoId = req.body.id_empleado || req.body.empleadoId;
    if (!empleadoId) return badRequest(res, "El campo id_empleado es requerido");

    const userRepo = new UserRepository();
    const useCase  = new AsignarEmpleadoProduccion(prodRepo, userRepo);
    const result   = await useCase.execute(req.params.id, empleadoId);
    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 422 || err.statusCode === 403 || err.statusCode === 401) return badRequest(res, err.message);
    return handleError(res, err);
  }
};

// ── Reasignar empleado a etapa actual (reemplazo con justificación) ─────────

const reasignarEmpleado = async (req, res) => {
  try {
    const empleadoId = req.body.id_empleado || req.body.empleadoId;
    const motivo = (req.body.motivo || "").toString().trim();
    if (!empleadoId) return badRequest(res, "El campo id_empleado es requerido");

    const userRepo = new UserRepository();
    const useCase  = new AsignarEmpleadoProduccion(prodRepo, userRepo);
    const result   = await useCase.execute(req.params.id, empleadoId);

    // Registrar la justificación del reemplazo en el historial de la orden.
    if (motivo) {
      const userId   = req.user?.id || req.user?._id || null;
      const userName = req.user?.nombreCompleto || req.user?.nombre || req.user?.username || "Sistema";
      await prodRepo.agregarHistorial(
        req.params.id,
        `Reasignación de empleado responsable: ${motivo}`,
        userId,
        userName,
        result.estado || "Reasignación",
      ).catch(() => {});
    }

    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 422 || err.statusCode === 403 || err.statusCode === 401) return badRequest(res, err.message);
    return handleError(res, err);
  }
};

// ── Confirmar etapa por empleado ─────────────────────────────────────────────

const confirmarEtapa = async (req, res) => {
  try {
    const solicitanteId = req.user?.id || req.body.id_usuario;
    if (!solicitanteId) return badRequest(res, "No se pudo identificar al usuario solicitante");

    const userRepo = new UserRepository();
    const useCase  = new ConfirmarEtapaProduccion(prodRepo, userRepo);
    const result   = await useCase.execute(req.params.id, solicitanteId);
    return ok(res, result);
  } catch (err) {
    if (err.statusCode === 404) return notFound(res, err.message);
    if (err.statusCode === 422 || err.statusCode === 403 || err.statusCode === 401) return badRequest(res, err.message);
    return handleError(res, err);
  }
};

// ── PUT /produccion/detalle-orden/:id ────────────────────────────────────────
// Actualiza un detalle de orden (cantidad, color, etc.)
const updateOrderDetail = async (req, res) => {
  try {
    const detail = await detailRepo.findById(req.params.id);
    if (!detail) return notFound(res, "Detalle no encontrado");

    const ALLOWED_FIELDS = new Set(["cantidad", "color", "id_producto", "refCorte"]);
    const changes = {};
    for (const [key, value] of Object.entries(req.body)) {
      if (ALLOWED_FIELDS.has(key) && value !== undefined) {
        changes[key] = key === "cantidad" ? Number(value) : value;
      }
    }

    if (Object.prototype.hasOwnProperty.call(changes, "cantidad") && (!changes.cantidad || changes.cantidad < 0)) {
      return badRequest(res, "La cantidad debe ser un número positivo");
    }

    const updated = await detailRepo.update(req.params.id, changes);
    if (!updated) return serverError(res, "Error al actualizar el detalle");

    // Registrar en el historial de la orden
    const userId   = req.user?.id || req.user?._id || null;
    const userName = req.user?.nombreCompleto || req.user?.nombre || req.user?.username || "Sistema";
    await prodRepo.agregarHistorial(
      detail.id_orden,
      `Detalle actualizado: producto ${detail.id_producto} - cambios: ${JSON.stringify(changes)}`,
      userId,
      userName,
      "Actualización",
    ).catch(() => {});

    return ok(res, updated.toJSON ? updated.toJSON() : updated);
  } catch (err) {
    return handleError(res, err);
  }
};

// ── DELETE /produccion/asignaciones/:id ──────────────────────────────────────
// Elimina una asignación de tercero individual
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await assignmentRepo.findById(req.params.id);
    if (!assignment) return notFound(res, "Asignación no encontrada");

    const deleted = await assignmentRepo.delete(req.params.id);
    if (!deleted) return serverError(res, "Error al eliminar la asignación");

    return ok(res, { deleted: true });
  } catch (err) {
    return handleError(res, err);
  }
};

// ── DELETE /produccion/asignaciones/orden/:id_orden ──────────────────────────
// Elimina todas las asignaciones de terceros para una orden
const deleteAssignmentsByOrder = async (req, res) => {
  try {
    const deletedCount = await assignmentRepo.deleteByOrder(req.params.id_orden);
    return ok(res, { deleted: deletedCount });
  } catch (err) {
    return handleError(res, err);
  }
};

const agregarHistorial = async (req, res) => {
  try {
    const { motivo, estado } = req.body;
    const userId = req.body.id_usuario || req.user?.id || req.user?.nombre || "Sistema";
    const user = req.body.user || req.user?.nombre || "Sistema";
    const order = await prodRepo.findById(req.params.id);
    if (!order) return notFound(res, "Orden no encontrada");
    const estadoRegistro = estado || order.estado;
    const updated = await prodRepo.agregarHistorial(req.params.id, motivo, userId, user, estadoRegistro);
    return ok(res, updated ? updated.toJSON() : order.toJSON());
  } catch (err) {
    return handleError(res, err);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  anularOrder,
  cambiarEstado,
  asignarEmpleado,
  reasignarEmpleado,
  confirmarEtapa,
  getEstados,
  getOrderDetails,
  createOrderDetail,
  updateOrderDetail,
  deleteOrderDetail,
  getAssignments,
  createAssignment,
  deleteAssignment,
  deleteAssignmentsByOrder,
  getEmployeeWorkload,
  getCalendario,
  getAlertas,
  agregarHistorial,
};

