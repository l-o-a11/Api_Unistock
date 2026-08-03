const ClientModel = require("../db/ClientModel");

class ClientRepository {
  async findAll(filters = {}) {
    const query = {};
    const { search, documento, nombre } = filters;

    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ nombre: regex }, { documento: regex }, { correo: regex }, { telefono: regex }];
    }

    if (documento) query.documento = String(documento).trim();
    if (nombre) query.nombre = new RegExp(nombre, "i");

    return ClientModel.find(query).sort({ nombre: 1 });
  }

  async findById(id) {
    return ClientModel.findById(id);
  }

  async findByDocumento(documento) {
    return ClientModel.findOne({ documento: String(documento).trim() });
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
