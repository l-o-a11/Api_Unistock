// infrastructure/repositories/CompraRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.
// Si cambias de BD, solo cambias este archivo.

const { store } = require("../../Config/database");
const Compra = require("../../domain/entities/Compra");

class CompraRepository {
  // Convierte un objeto plano del store en una entidad Compra
  _toEntity(raw) {
    return raw ? new Compra(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.compras();

    if (filters.proveedorId !== undefined) {
      result = result.filter((c) => c.proveedorId === parseInt(filters.proveedorId));
    }
    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter((c) => c.estado === active);
    }
    // Agregar más filtros si es necesario

    return result.map((c) => this._toEntity(c));
  }

  findById(id) {
    const raw = store.compras().find((c) => c.id === parseInt(id));
    return this._toEntity(raw);
  }

  create(data) {
    const newRaw = { id: store.nextId(), ...data };
    store.compras().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.compras();
    const idx = list.findIndex((c) => c.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.compras();
    const idx = list.findIndex((c) => c.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }
}

module.exports = CompraRepository;