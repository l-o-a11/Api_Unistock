// infrastructure/repositories/MaterialTechnicalSpecificationsRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.
// Si cambias de BD, solo cambias este archivo.

const { store } = require("../../Config/database");
const product = require("../../domain/entities/MaterialTechnicalSpecifications");

class MaterialTechnicalSpecificationsRepository {
  // Convierte un objeto plano del store en una entidad MaterialTechnicalSpecifications
  _toEntity(raw) {
    return raw ? new MaterialTechnicalSpecifications(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.materialTechnicalSpecifications();

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (mts) =>
          mts.cantidades.toString().toLowerCase().includes(term),
      );
    }

    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter((mts) => mts.estado === active);
    }

    return result.map((mts) => this._toEntity(mts));
  }

  findById(id) {
    const raw = store.materialTechnicalSpecifications().find((mts) => mts.id === parseInt(id));
    return this._toEntity(raw);
  }

  save(data) {
    const newRaw = { id: store.nextId(), ...data };
    store.materialTechnicalSpecifications().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.materialTechnicalSpecifications();
    const idx = list.findIndex((mts) => mts.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.materialTechnicalSpecifications();
    const idx = list.findIndex((mts) => mts.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }
}

module.exports = MaterialTechnicalSpecificationsRepository;