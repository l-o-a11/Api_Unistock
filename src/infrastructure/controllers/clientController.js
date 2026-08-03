const ClientRepository = require("../repositories/ClientRepository");
const { ok, created, badRequest, notFound, serverError, conflict } = require("../../shared/utils/response");

const repo = new ClientRepository();

const listClients = async (req, res) => {
  try {
    const clients = await repo.findAll(req.query);
    return ok(res, clients.map((c) => ({ id: c._id.toString(), ...c.toObject() })));
  } catch (err) {
    return serverError(res, err.message);
  }
};

const getClientById = async (req, res) => {
  try {
    const client = await repo.findById(req.params.id);
    if (!client) return notFound(res, "Cliente no encontrado");
    return ok(res, { id: client._id.toString(), ...client.toObject() });
  } catch (err) {
    return serverError(res, err.message);
  }
};

const createClient = async (req, res) => {
  try {
    const nombreLimpio = String(req.body.nombre || "").trim();
    const documentoLimpio = String(req.body.documento || "").trim();
    const telefonoLimpio = String(req.body.telefono || "").trim();
    const correoLimpio = String(req.body.correo || "").trim();
    if (!nombreLimpio || !documentoLimpio) return badRequest(res, "Nombre y documento son obligatorios");

    const existing = await repo.findByDocumento(documentoLimpio);
    if (existing) return conflict(res, "Ya existe un cliente con ese documento");

    const client = await repo.create({
      nombre: nombreLimpio,
      documento: documentoLimpio,
      telefono: telefonoLimpio,
      correo: correoLimpio,
    });
    return created(res, { id: client._id.toString(), ...client.toObject() });
  } catch (err) {
    return serverError(res, err.message);
  }
};

const updateClient = async (req, res) => {
  try {
    const client = await repo.findById(req.params.id);
    if (!client) return notFound(res, "Cliente no encontrado");

    const changes = {};
    if (Object.prototype.hasOwnProperty.call(req.body, "nombre")) {
      changes.nombre = String(req.body.nombre || "").trim();
      if (!changes.nombre) return badRequest(res, "El nombre es obligatorio");
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "documento")) {
      changes.documento = String(req.body.documento || "").trim();
      if (!changes.documento) return badRequest(res, "El documento es obligatorio");
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "telefono")) {
      changes.telefono = String(req.body.telefono || "").trim();
    }
    if (Object.prototype.hasOwnProperty.call(req.body, "correo")) {
      changes.correo = String(req.body.correo || "").trim();
    }

    if (changes.documento && changes.documento !== client.documento) {
      const existing = await repo.findByDocumento(changes.documento);
      if (existing) return conflict(res, "Ya existe un cliente con ese documento");
    }

    const updated = await repo.update(req.params.id, changes);
    return ok(res, { id: updated._id.toString(), ...updated.toObject() });
  } catch (err) {
    return serverError(res, err.message);
  }
};

const deleteClient = async (req, res) => {
  try {
    const client = await repo.findById(req.params.id);
    if (!client) return notFound(res, "Cliente no encontrado");
    await repo.delete(req.params.id);
    return ok(res, { message: "Cliente eliminado" });
  } catch (err) {
    return serverError(res, err.message);
  }
};

module.exports = {
  listClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
};
