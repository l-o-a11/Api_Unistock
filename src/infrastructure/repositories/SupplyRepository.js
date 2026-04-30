// infrastructure/repositories/SupplyRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.
// Si cambias de BD, solo cambias este archivo.

const { store } = require("../../Config/database");
const Supply = require("../../domain/entities/Supply");

class SupplyRepository {
  // Convierte un objeto plano del store en una entidad Supply
  _toEntity(raw) {
    return raw ? new Supply(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.supplies();

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (i) =>
          i.nombre.toLowerCase().includes(term) ||
          i.categoria.toLowerCase().includes(term)
      );
    }
    if (filters.categoria !== undefined) {
      result = result.filter((i) => i.categoria === filters.categoria);
    }
    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter((i) => i.estado === active);
    }

    return result.map((i) => this._toEntity(i));
  }

  findById(id) {
    const raw = store.supplies().find((i) => i.id === parseInt(id));
    return this._toEntity(raw);
  }

  create(data) {
    const now = new Date();
    const newRaw = {
      id: store.nextId(),
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    store.supplies().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.supplies();
    const idx = list.findIndex((i) => i.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...changes,
      updatedAt: new Date(),
    };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.supplies();
    const idx = list.findIndex((i) => i.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }

  // Catálogos
  findAllCategorias() {
    return store.suppliesCategories().filter(c => c.estado === true);
  }

  findCategoriaById(id) {
    const parsed = parseInt(id);
    return store.suppliesCategories().find(c => c.id === parsed && c.estado === true) || null;
  }
}

module.exports = SupplyRepository;