// infrastructure/repositories/ProductRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.
// Si cambias de BD, solo cambias este archivo.

const { store } = require("../../Config/database");
const product = require("../../domain/entities/Products");

class ProductRepository {
  // Convierte un objeto plano del store en una entidad Product
  _toEntity(raw) {
    return raw ? new Product(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.products();

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.imagenes_Url.toString().toLowerCase().includes(term) ||
          p.referencia.toLowerCase().includes(term) ||
          p.nombre.toLowerCase().includes(term) ||
          p.precio.toLowerCase().includes(term) ||
          p.stock.toString().toLowerCase().includes(term),
      );
    }

    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter((p) => p.estado === active);
    }

    return result.map((p) => this._toEntity(p));
  }

  findById(id) {
    const raw = store.products().find((p) => p.id === parseInt(id));
    return this._toEntity(raw);
  }

  save(data) {
    const newRaw = { id: store.nextId(), ...data };
    store.products().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.products();
    const idx = list.findIndex((p) => p.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.products();
    const idx = list.findIndex((p) => p.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }
}

module.exports = ProductRepository;