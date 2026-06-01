// infrastructure/repositories/ProductionRepository.js
const ProductionOrderModel = require("../db/ProductionOrderModel");
const Production = require("../../domain/entities/Production");

class ProductionRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    const id = obj._id ? (obj._id.toString ? obj._id.toString() : String(obj._id)) : obj.id;
    return new Production({ ...obj, id });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.cliente)    query.cliente    = new RegExp(filters.cliente, "i");
    if (filters.id_usuario) query.id_usuario = filters.id_usuario;
    if (filters.estado)     query.estado     = filters.estado;
    const docs = await ProductionOrderModel.find(query).sort({ createdAt: -1 });
    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await ProductionOrderModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await ProductionOrderModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await ProductionOrderModel
      .findByIdAndUpdate(id, changes, { new: true })
      .catch(() => null);
    return this._toEntity(doc);
  }

  /**
   * Anula una orden: pone estado "Anulada", guarda motivo
   * y agrega entrada al historial.
   */
  async anular(id, motivo, id_usuario) {
    const historialEntry = {
      estado: "Anulada",
      fecha: new Date(),
      id_usuario: id_usuario || null,
      motivo: motivo || null,
    };
    const doc = await ProductionOrderModel
      .findByIdAndUpdate(
        id,
        {
          estado: "Anulada",
          motivo_anulacion: motivo || null,
          $push: { historial: historialEntry },
        },
        { new: true },
      )
      .catch(() => null);
    return this._toEntity(doc);
  }

  /**
   * Cambia el estado de la orden y registra la transición en el historial.
   */
  async cambiarEstado(id, nuevoEstado, id_usuario) {
    const historialEntry = {
      estado: nuevoEstado,
      fecha: new Date(),
      id_usuario: id_usuario || null,
      motivo: null,
    };
    const doc = await ProductionOrderModel
      .findByIdAndUpdate(
        id,
        {
          estado: nuevoEstado,
          $push: { historial: historialEntry },
        },
        { new: true },
      )
      .catch(() => null);
    return this._toEntity(doc);
  }
}

module.exports = ProductionRepository;
