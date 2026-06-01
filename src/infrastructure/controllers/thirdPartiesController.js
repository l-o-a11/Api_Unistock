// infrastructure/controllers/thirdPartiesController.js
const ThirdPartiesRepository = require("../repositories/ThirdPartiesRepository");
const { ok, created, badRequest, notFound, conflict, serverError } = require("../../shared/utils/response");

const repo = new ThirdPartiesRepository();

const getThirdParties = async (req, res) => {
  try {
    return ok(res, await repo.findAll(req.query));
  } catch (err) {
    console.error("[thirdPartiesController] Error getting terceros:", err);
    return serverError(res);
  }
};

const getThirdPartyById = async (req, res) => {
  try {
    const tp = await repo.findById(req.params.id);
    if (!tp) return notFound(res, "Tercero no encontrado");
    return ok(res, tp);
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

module.exports = {
  getThirdParties,
  getThirdPartyById,
  createThirdParty,
  updateThirdParty,
  toggleThirdParty,
  deleteThirdParty,
};
