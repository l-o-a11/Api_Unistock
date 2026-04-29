// infrastructure/repositories/CategoriaInsumoRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.
// Si cambias de BD, solo cambias este archivo.

const { store } = require("../../Config/database");
const CategoriaInsumo = require("../../domain/entities/CategoriaInsumo");

class CategoriaInsumoRepository {
  // Convierte un objeto plano del store en una entidad CategoriaInsumo
  _toEntity(raw) {
    return raw ? new CategoriaInsumo(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.categoriasInsumos();

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (c) =>
          c.nombre.toLowerCase().includes(term) ||
          c.descripcion.toLowerCase().includes(term),
      );
    }
    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter((c) => c.estado === active);
    }

    return result.map((c) => this._toEntity(c));
  }

  findById(id) {
    const raw = store.categoriasInsumos().find((c) => c.id === parseInt(id));
    return this._toEntity(raw);
  }

  save(data) {
    const newRaw = { id: store.nextId(), ...data };
    store.categoriasInsumos().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.categoriasInsumos();
    const idx = list.findIndex((c) => c.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.categoriasInsumos();
    const idx = list.findIndex((c) => c.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }
}

module.exports = CategoriaInsumoRepository;