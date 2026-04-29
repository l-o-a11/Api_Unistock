// infrastructure/repositories/ProductCategoryRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.
// Si cambias de BD, solo cambias este archivo.

const { store } = require("../../Config/database");
const ProductCategory = require("../../domain/entities/ProductCategory");

class ProductCategoryRepository {
  // Convierte un objeto plano del store en una entidad ProductCategory
  _toEntity(raw) {
    return raw ? new ProductCategory(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.productCategories();

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (pc) =>
          pc.nombre.toLowerCase().includes(term) ||
          pc.descripcion.toLowerCase().includes(term),
      );
    }

    if (filters.estado !== undefined) {
      const active = filters.estado === "true" || filters.estado === true;
      result = result.filter((pc) => pc.estado === active);
    }

    return result.map((pc) => this._toEntity(pc));
  }

  findById(id) {
    const raw = store.productCategories().find((pc) => pc.id === parseInt(id));
    return this._toEntity(raw);
  }

  save(data) {
    const newRaw = { id: store.nextId(), ...data };
    store.productCategories().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.productCategories();
    const idx = list.findIndex((pc) => pc.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.productCategories();
    const idx = list.findIndex((pc) => pc.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }
}

module.exports = ProductCategoryRepository;