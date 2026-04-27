// infrastructure/repositories/UserRepository.js

const { store } = require("../../Config/database");
const User = require("../../domain/entities/User");

class UserRepository {
  _toEntity(raw) {
    return raw ? new User(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.users();

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.nombreCompleto.toLowerCase().includes(term) ||
          u.correo.toLowerCase().includes(term) ||
          u.numeroDocumento.includes(term),
      );
    }
    if (filters.rolId !== undefined) {
      result = result.filter((u) => u.rolId === parseInt(filters.rolId));
    }
    if (filters.sedeId !== undefined) {
      result = result.filter((u) => u.sedeId === parseInt(filters.sedeId));
    }
    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter((u) => u.estado === active);
    }

    return result.map((u) => this._toEntity(u));
  }

  findById(id) {
    const raw = store.users().find((u) => u.id === parseInt(id));
    return this._toEntity(raw);
  }

  findByEmail(correo) {
    const raw = store.users().find((u) => u.correo === correo);
    return this._toEntity(raw);
  }

  findByDocument(numeroDocumento) {
    const raw = store
      .users()
      .find((u) => u.numeroDocumento === numeroDocumento);
    return this._toEntity(raw);
  }

  countActiveAdmins() {
    return store.users().filter((u) => u.rolId === 2 && u.estado === true)
      .length;
  }

  save(data) {
    const newRaw = { id: store.nextId(), ...data };
    store.users().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.users();
    const idx = list.findIndex((u) => u.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.users();
    const idx = list.findIndex((u) => u.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }

  // Catálogos
  findAllRoles() {
    return store.roles.filter((r) => r.estado !== false);
  }

  findRoleById(id) {
    return store.roles.find((r) => r.id === parseInt(id)) || null;
  }

  findAllSedes() {
    return store.sedes.filter((s) => s.estado !== false);
  }

  findSedeById(id) {
    return store.sedes.find((s) => s.id === parseInt(id)) || null;
  }
}

module.exports = UserRepository;