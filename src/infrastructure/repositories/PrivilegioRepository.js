// infrastructure/repositories/PrivilegioRepository.js

const { store } = require("../../Config/database");
const Privilegio = require("../../domain/entities/Privilegio");

class PrivilegioRepository {
  _toEntity(raw) {
    return raw ? new Privilegio(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.privilegios();

    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter(p => p.estado === active);
    }

    return result.map(p => this._toEntity(p));
  }

  findByNombre(nombre) {
    const raw = store.privilegios().find(p => p.nombre === nombre.toLowerCase());
    return this._toEntity(raw);
  }
}

module.exports = PrivilegioRepository;
