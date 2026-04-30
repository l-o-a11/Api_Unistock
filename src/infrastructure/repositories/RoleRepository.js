// infrastructure/repositories/RoleRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.
// Si cambias de BD, solo cambias este archivo.

const { store } = require("../../Config/database");
const Role = require("../../domain/entities/Role");

class RoleRepository {
  // Convierte un objeto plano del store en una entidad Role
  _toEntity(raw) {
    return raw ? new Role(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.roles();

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.nombre.toLowerCase().includes(term) ||
          r.descripcion.toLowerCase().includes(term)
      );
    }
    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter((r) => r.estado === active);
    }

    return result.map((r) => this._toEntity(r));
  }

  findById(id) {
    const raw = store.roles().find((r) => r.id === parseInt(id));
    return this._toEntity(raw);
  }

  findByName(nombre) {
    const raw = store.roles().find((r) => r.nombre === nombre);
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
    store.roles().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.roles();
    const idx = list.findIndex((r) => r.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = {
      ...list[idx],
      ...changes,
      updatedAt: new Date(),
    };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.roles();
    const idx = list.findIndex((r) => r.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }
}

module.exports = RoleRepository;