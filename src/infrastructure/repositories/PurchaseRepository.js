// infrastructure/repositories/PurchaseRepository.js

const PurchaseModel = require("../db/PurchaseModel");
const Purchase = require("../../domain/entities/Purchase");

class PurchaseRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;

    // proveedorId puede ser ObjectId (sin populate) o un objeto {_id, nombre_de_empresa, nit}
    // (con populate). En ambos casos extraemos el ID como string.
    let proveedorId = null;
    if (obj.proveedorId) {
      if (typeof obj.proveedorId === "object" && obj.proveedorId._id) {
        proveedorId = obj.proveedorId._id.toString();
      } else {
        proveedorId = obj.proveedorId.toString();
      }
    }

    return new Purchase({
      ...obj,
      id: obj._id.toString(),
      proveedorId,
      motivoAnulacion: obj.motivoAnulacion ?? null,
      fechaAnulacion: obj.fechaAnulacion ?? null,
    });
  }

  async findAll(filters = {}) {
    const query = {};

    if (filters.proveedorId) query.proveedorId = filters.proveedorId;
    if (filters.numeroFactura) query.numeroFactura = { $regex: filters.numeroFactura, $options: "i" };
    if (filters.anulada !== undefined) {
      query.anulada = filters.anulada === "true" || filters.anulada === true;
    }

    const docs = await PurchaseModel
      .find(query)
      .populate("proveedorId", "nombre_de_empresa nit")
      .sort({ createdAt: -1 });

    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await PurchaseModel
      .findById(id)
      .populate("proveedorId", "nombre_de_empresa nit")
      .catch(() => null);
    return this._toEntity(doc);
  }

  async findByNumeroFactura(numeroFactura) {
    const doc = await PurchaseModel.findOne({ numeroFactura }).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await PurchaseModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await PurchaseModel
      .findByIdAndUpdate(id, changes, { new: true })
      .populate("proveedorId", "nombre_de_empresa nit")
      .catch(() => null);
    return this._toEntity(doc);
  }

  // Anulación dedicada — nunca hace toggle, solo anula con motivo
  async anular(id, motivo) {
    const doc = await PurchaseModel
      .findByIdAndUpdate(
        id,
        {
          anulada: true,
          motivoAnulacion: motivo,
          fechaAnulacion: new Date(),
        },
        { new: true }
      )
      .catch(() => null);
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await PurchaseModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = PurchaseRepository;