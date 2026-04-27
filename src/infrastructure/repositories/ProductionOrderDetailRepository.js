// infrastructure/repositories/ProductionOrderDetailRepository.js
const { store } = require("../../Config/database");
const ProductionOrderDetail = require("../../domain/entities/ProductionOrderDetail");

class ProductionOrderDetailRepository {
  _toEntity(raw) {
    return raw ? new ProductionOrderDetail(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.productionOrderDetails();

    if (filters.id_orden) {
      result = result.filter((pod) => pod.id_orden === parseInt(filters.id_orden));
    }

    return result.map((pod) => this._toEntity(pod));
  }

  findById(id) {
    const raw = store.productionOrderDetails().find((pod) => pod.id === parseInt(id));
    return this._toEntity(raw);
  }

  create(data) {
    const details = store.productionOrderDetails();
    const maxId = details.length > 0 ? Math.max(...details.map(d => d.id)) : 0;
    const newDetail = {
      id: maxId + 1,
      ...data,
    };
    details.push(newDetail);
    return this._toEntity(newDetail);
  }

  update(id, data) {
    const details = store.productionOrderDetails();
    const index = details.findIndex((pod) => pod.id === parseInt(id));
    if (index === -1) return null;

    details[index] = { ...details[index], ...data };
    return this._toEntity(details[index]);
  }

  delete(id) {
    const details = store.productionOrderDetails();
    const index = details.findIndex((pod) => pod.id === parseInt(id));
    if (index === -1) return false;

    details.splice(index, 1);
    return true;
  }
}

module.exports = ProductionOrderDetailRepository;
