// infrastructure/repositories/TechnicalSpecificationsRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.
// Si cambias de BD, solo cambias este archivo.

const { store } = require("../../Config/database");
const product = require("../../domain/entities/TechnicalSpecifications");

class TechnicalSpecificationsRepository {
  // Convierte un objeto plano del store en una entidad TechnicalSpecifications
  _toEntity(raw) {
    return raw ? new TechnicalSpecifications(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.technicalSpecifications();

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (ts) =>
          ts.responsable.toString().toLowerCase().includes(term) ||
          ts.fecha_inicio.toLowerCase().includes(term) ||
          ts.fecha_fin.toLowerCase().includes(term) ||
          ts.versiones.toString().toLowerCase().includes(term) ||
          ts.descripciones.toString().toLowerCase().includes(term),
      );
    }

    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter((ts) => ts.estado === active);
    }

    return result.map((ts) => this._toEntity(ts));
  }

  findById(id) {
    const raw = store.technicalSpecifications().find((ts) => ts.id === parseInt(id));
    return this._toEntity(raw);
  }

  save(data) {
    const newRaw = { id: store.nextId(), ...data };
    store.technicalSpecifications().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.technicalSpecifications();
    const idx = list.findIndex((ts) => ts.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.technicalSpecifications();
    const idx = list.findIndex((ts) => ts.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }
}

module.exports = TechnicalSpecificationsRepository;