// infrastructure/repositories/PurchaseDetailRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.

const { store } = require("../../Config/database");
const PurchaseDetail = require("../../domain/entities/PurchaseDetail");

class PurchaseDetailRepository {
  // Convierte un objeto plano del store en una entidad PurchaseDetail
  _toEntity(raw) {
    return raw ? new PurchaseDetail(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.detallePurchases();

    if (filters.purchaseId !== undefined) {
      result = result.filter((d) => d.purchaseId === parseInt(filters.purchaseId));
    }
    // Agregar más filtros si es necesario

    return result.map((d) => this._toEntity(d));
  }

  findById(id) {
    const raw = store.detallePurchases().find((d) => d.id === parseInt(id));
    return this._toEntity(raw);
  }

  create(data) {
    const newRaw = { id: store.nextId(), ...data };
    store.detallePurchases().push(newRaw);
    return this._toEntity(newRaw);
  }

  update(id, changes) {
    const list = store.detallePurchases();
    const idx = list.findIndex((d) => d.id === parseInt(id));
    if (idx === -1) return null;
    list[idx] = { ...list[idx], ...changes };
    return this._toEntity(list[idx]);
  }

  delete(id) {
    const list = store.detallePurchases();
    const idx = list.findIndex((d) => d.id === parseInt(id));
    if (idx === -1) return false;
    list.splice(idx, 1);
    return true;
  }
}

module.exports = PurchaseDetailRepository;