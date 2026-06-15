// infrastructure/controllers/thirdPartiesController.js
const ThirdPartiesRepository = require("../repositories/ThirdPartiesRepository");
const ThirdPartyAssignmentRepository = require("../repositories/ThirdPartyAssignmentRepository");
const ProductionRepository = require("../repositories/ProductionRepository");
const { ok, created, badRequest, notFound, conflict, serverError } = require("../../shared/utils/response");

const repo = new ThirdPartiesRepository();
const assignmentRepo = new ThirdPartyAssignmentRepository();
const productionRepo = new ProductionRepository();

const idToString = (value, depth = 0) => {
  if (!value) return "";
  if (depth > 5) return value?.toString ? value.toString() : String(value);

  // Evitar recursión infinita si Mongoose/valor se refiere a sí mismo
  if (value._id && value._id !== value) return idToString(value._id, depth + 1);

  return value.toString ? value.toString() : String(value);
};


const entityToJSON = (entity) => (entity?.toJSON ? entity.toJSON() : entity);

const buildProduccionesByThirdParty = async (thirdPartyIds = []) => {
  const allowedIds = new Set(thirdPartyIds.map(idToString).filter(Boolean));
  const allAssignments = await assignmentRepo.findAll();
  const assignments = allAssignments.filter((assignment) => {
    const terceroId = idToString(assignment.id_tercero);
    return !allowedIds.size || allowedIds.has(terceroId);
  });

  const orderIds = [...new Set(assignments.map((assignment) => idToString(assignment.id_orden)).filter(Boolean))];
  const orders = await Promise.all(
    orderIds.map(async (orderId) => [orderId, entityToJSON(await productionRepo.findById(orderId).catch(() => null))]),
  );
  const orderById = new Map(orders);

  const grouped = new Map();
  for (const assignment of assignments) {
    const terceroId = idToString(assignment.id_tercero);
    const orderId = idToString(assignment.id_orden);
    const order = orderById.get(orderId);
    const producciones = grouped.get(terceroId) || [];
    const existing = producciones.find((item) => item.produccionId === orderId);

    if (existing) {
      existing.cantidad += Number(assignment.cantidad) || 0;
      continue;
    }

    producciones.push({
      orden: order?.numero_orden || order?.orderNumber || orderId,
      orderNumber: order?.numero_orden || order?.orderNumber || orderId,
      fecha: order?.fecha_entrega || assignment.fecha || "",
      produccionId: order?.id || orderId,
      cantidad: Number(assignment.cantidad) || 0,
      // ✅ Incluir estado de la orden para que el frontend pueda filtrar
      // las que ya pasaron de "Producción" a "Empaque" o posteriores
      estado: order?.estado || null,
    });
    grouped.set(terceroId, producciones);
  }

  return grouped;
};

const attachProducciones = async (thirdParties) => {
  const list = Array.isArray(thirdParties) ? thirdParties : [thirdParties];
  const plainList = list.map(entityToJSON).filter(Boolean);
  const produccionesByThirdParty = await buildProduccionesByThirdParty(plainList.map((tp) => tp.id || tp._id));

  const enriched = plainList.map((tp) => ({
    ...tp,
    producciones: produccionesByThirdParty.get(idToString(tp.id || tp._id)) || [],
  }));

  return Array.isArray(thirdParties) ? enriched : enriched[0];
};

const getThirdParties = async (req, res) => {
  try {
    const terceros = await repo.findAll(req.query);
    return ok(res, await attachProducciones(terceros));
  } catch (err) {
    console.error("[thirdPartiesController] Error getting terceros:", err);
    return serverError(res);
  }
};

const getThirdPartyById = async (req, res) => {
  try {
    const tp = await repo.findById(req.params.id);
    if (!tp) return notFound(res, "Tercero no encontrado");
    return ok(res, await attachProducciones(tp));
  } catch (err) {
    console.error("[thirdPartiesController] Error getting tercero:", err);
    return serverError(res);
  }
};

const createThirdParty = async (req, res) => {
  try {
    const data = req.validatedData || req.body;

    const nombreEmpresa = data.nombre_empresa ?? data.nombre;
    const nombreContacto = data.nombre_contacto ?? data.contacto;

    const duplicatedName = await repo.findByCompanyName(nombreEmpresa);
    if (duplicatedName) {
      return conflict(res, "Ya existe un tercero con ese nombre");
    }

    const estadoRaw = data.estado;
    const estadoParsed =
      estadoRaw === undefined || estadoRaw === null
        ? true
        : estadoRaw === true || estadoRaw === "true";

    const telefono =
      data.telefono !== undefined && data.telefono !== null
        ? String(data.telefono)
        : undefined;

    const tp = await repo.create({
      nit: data.nit !== undefined && data.nit !== null ? String(data.nit) : undefined,
      nombre_empresa: nombreEmpresa,
      nombre_contacto: nombreContacto,
      correo_empresa: data.correo_empresa,
      correo_contacto: data.correo_contacto,
      direccion: data.direccion,
      telefono,
      sitio_web: data.sitio_web,
      estado: estadoParsed,
    });

    return created(res, tp);
  } catch (err) {
    console.error("[thirdPartiesController] Error creating tercero:", err);
    return serverError(res);
  }
};

const updateThirdParty = async (req, res) => {
  try {
    const tp = await repo.findById(req.params.id);
    if (!tp) return notFound(res, "Tercero no encontrado");

    const data = req.validatedData || req.body;

    const updateData = {};
    const nextNombreEmpresa = data.nombre || data.nombre_empresa;
    if (nextNombreEmpresa) {
      const duplicatedName = await repo.findByCompanyName(nextNombreEmpresa, req.params.id);
      if (duplicatedName) {
        return conflict(res, "Ya existe otro tercero con ese nombre");
      }
    }

    if (data.nit) updateData.nit = data.nit;
    if (nextNombreEmpresa)
      updateData.nombre_empresa = nextNombreEmpresa;
    if (data.contacto || data.nombre_contacto)
      updateData.nombre_contacto = data.contacto || data.nombre_contacto;

    if (data.telefono !== undefined && data.telefono !== null)
      updateData.telefono = String(data.telefono);

    if (data.estado !== undefined) {
      updateData.estado = data.estado === true || data.estado === "true";
    }

    if (data.correo_empresa) updateData.correo_empresa = data.correo_empresa;
    if (data.correo_contacto) updateData.correo_contacto = data.correo_contacto;
    if (data.direccion) updateData.direccion = data.direccion;
    if (data.sitio_web) updateData.sitio_web = data.sitio_web;

    if (data.estado !== undefined)
      updateData.estado = data.estado === true || data.estado === "true";

    return ok(res, await repo.update(req.params.id, updateData));
  } catch (err) {
    console.error("[thirdPartiesController] Error updating tercero:", err);
    return serverError(res);
  }
};

const toggleThirdParty = async (req, res) => {
  try {
    const tp = await repo.findById(req.params.id);
    if (!tp) return notFound(res, "Tercero no encontrado");

    const nextEstado = !(tp.estado === true);
    const updated = await repo.update(req.params.id, { estado: nextEstado });
    return ok(res, updated);
  } catch (err) {
    console.error("[thirdPartiesController] Error toggling tercero:", err);
    return serverError(res);
  }
};

const deleteThirdParty = async (req, res) => {
  try {
    const tp = await repo.findById(req.params.id);
    if (!tp) return notFound(res, "Tercero no encontrado");
    await repo.delete(req.params.id);
    return ok(res, { message: "Tercero eliminado exitosamente" });
  } catch (err) {
    console.error("[thirdPartiesController] Error deleting tercero:", err);
    return serverError(res);
  }
};

// ── Vinculación Tercero ↔ Producción ───────────────────────────────────────
// Endpoint: POST /api/terceros/:id/producciones
// Payload esperado (frontend): { orden, fecha, produccionId, cantidad }
// Persistencia real: ThirdPartyAssignment (id_tercero, id_orden, cantidad)
const linkProduccionToTercero = async (req, res) => {
  try {
    const thirdPartyId = req.params.id;
    if (!thirdPartyId) return badRequest(res, "Falta id del tercero");

    const data = req.body || {};
    const produccionId = data.produccionId || data.produccion_id || data.id_orden || data.ordenId || data.orden;
    const cantidad = Number(data.cantidad) || 0;

    if (!produccionId) return badRequest(res, "Falta produccionId (o equivalente)");
    if (!cantidad || cantidad <= 0) return badRequest(res, "La cantidad debe ser > 0");

    // Validar que la orden exista
    const production = await productionRepo.findById(produccionId).catch(() => null);
    if (!production) {
      return notFound(res, "Producción/orden no encontrada");
    }

    // Upsert: si ya existe asignación para (id_tercero, id_orden), sumar/actualizar cantidad
    const all = await assignmentRepo.findAll({ id_tercero: thirdPartyId, id_orden: produccionId });
    if (all && all.length > 0) {
      const existing = all[0];
      const nextCantidad = (Number(existing.cantidad) || 0) + cantidad;
      // assignmentRepo.update usa id del documento
      const updated = await assignmentRepo.update(existing.id || existing._id, { cantidad: nextCantidad, fecha: data.fecha || undefined });
      return ok(res, updated?.toJSON ? updated.toJSON() : updated);
    }

    const createdAssignment = await assignmentRepo.create({
      id_tercero: thirdPartyId,
      id_orden: produccionId,
      cantidad,
      fecha: data.fecha ? new Date(data.fecha) : undefined,
    });

    // Devolver el tercero actualizado con producciones (frontend espera algo, aunque no es crítico)
    return ok(res, await attachProducciones(await repo.findById(thirdPartyId)));
  } catch (err) {
    console.error("[thirdPartiesController] linkProduccionToTercero error:", err);
    return serverError(res);
  }
};

module.exports = {
  getThirdParties,
  getThirdPartyById,
  createThirdParty,
  updateThirdParty,
  toggleThirdParty,
  deleteThirdParty,
  linkProduccionToTercero,
};

