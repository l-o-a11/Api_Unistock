// infrastructure/repositories/CompraDetailRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.

const { store } = require("../../Config/database");
const CompraDetail = require("../../domain/entities/CompraDetail");

class CompraDetailRepository {
  // Convierte un objeto plano del store en una entidad CompraDetail
  _toEntity(raw) {
    return raw ? new CompraDetail(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.detalleCompras();

    if (filters.compraId !== undefined) {
      result = result.filter((d) => d.compraId === parseInt(filters.compraId));
    }
    // Agregar más filtros si es necesario

    return result.map((d) => this._toEntity(d));
  }

  findById(id) {
    const raw = store.detalleCompras().find((d) => d.id === parseInt(id));
    return this._toEntity(raw);
  }

  create(data) {
    const newRaw = { id: store.nextId(), ...data };
    store.detalleCompras().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.detalleCompras();
    const idx = list.findIndex((d) => d.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.detalleCompras();
    const idx = list.findIndex((d) => d.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }
}

module.exports = CompraDetailRepository;