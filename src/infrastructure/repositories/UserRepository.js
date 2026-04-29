const UserModel = require("../db/UserModel");

class UserRepository {

  async findAll(filters = {}, requestingUser) {
    const query = {};

    // Admin solo ve su sede
    if (requestingUser.rolNombre !== "Gerente") {
      query.sedeId = requestingUser.sedeId;
    }

    if (filters.search) {
      const term = new RegExp(filters.search, "i");
      query.$or = [
        { nombreCompleto: term },
        { correo: term },
        { numeroDocumento: term },
      ];
    }
    if (filters.rolId)  query.rolId  = filters.rolId;
    if (filters.sedeId && requestingUser.rolNombre === "Gerente") {
      query.sedeId = filters.sedeId;
    }
    if (filters.estado !== undefined) {
      query.estado = filters.estado === "true";
    }

    return UserModel.find(query).select("-password");
  }

  async findById(id) {
    return UserModel.findById(id);
  }

  async findByEmail(correo) {
    return UserModel.findOne({ correo });
  }

  async findByDocument(numeroDocumento) {
    return UserModel.findOne({ numeroDocumento });
  }

  async countActiveAdmins() {
    // TODO: cruzar con colección roles cuando esté disponible
    return UserModel.countDocuments({ estado: true });
  }

  async save(data) {
    const user = new UserModel(data);
    return user.save();
  }

  async update(id, changes) {
    return UserModel.findByIdAndUpdate(id, changes, { new: true }).select("-password");
  }

  async delete(id) {
    return UserModel.findByIdAndDelete(id);
  }
}

module.exports = UserRepository;