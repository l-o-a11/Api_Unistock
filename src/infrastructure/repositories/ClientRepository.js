const ClientModel = require("../db/ClientModel");
const { escapeRegex } = require("../../shared/utils/securityInput");

class ClientRepository {
  async findAll(filters = {}) {
    const query = {};
    const { search, documento, nombre } = filters;

    if (search) {
      const regex = new RegExp(escapeRegex(search).slice(0, 100), "i");
      query.$or = [{ nombre: regex }, { documento: regex }, { correo: regex }, { telefono: regex }];
    }

    if (documento) query.documento = String(documento).trim();
    if (nombre) query.nombre = new RegExp(escapeRegex(nombre).slice(0, 100), "i");

    return ClientModel.find(query).sort({ nombre: 1 });
  }

  async findById(id) {
    return ClientModel.findById(id);
  }

  async findByDocumento(documento) {
    return ClientModel.findOne({ documento: String(documento).trim() });
  }

  async findByNombre(nombre) {
    const value = String(nombre || "").trim();
    if (!value) return null;
    return ClientModel.findOne({ nombre: new RegExp(`^${escapeRegex(value)}$`, "i") });
  }

  async create(data) {
    return ClientModel.create(data);
  }

  async update(id, changes) {
    return ClientModel.findByIdAndUpdate(id, changes, { new: true, runValidators: true });
  }

  async delete(id) {
    return ClientModel.findByIdAndDelete(id);
  }
}

module.exports = ClientRepository;
