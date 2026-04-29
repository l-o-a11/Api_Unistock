// infrastructure/repositories/ModuloRepository.js

const { store } = require("../../Config/database");
const Modulo = require("../../domain/entities/Modulo");

class ModuloRepository {
  _toEntity(raw) {
    return raw ? new Modulo(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.modulos();

    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter(m => m.estado === active);
    }

    return result.map(m => this._toEntity(m));
  }

  findByNombre(nombre) {
    const raw = store.modulos().find(m => m.nombre === nombre.toLowerCase());
    return this._toEntity(raw);
  }
}

module.exports = ModuloRepository;
