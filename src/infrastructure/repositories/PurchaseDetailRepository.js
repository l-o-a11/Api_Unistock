// infrastructure/repositories/PurchaseDetailRepository.js

const PurchaseDetailModel = require("../db/PurchaseDetailModel");
const PurchaseDetail = require("../../domain/entities/PurchaseDetail");

class PurchaseDetailRepository {
  // FIX: cuando findAll/findById usan .populate("insumoId"), el campo
  // obj.insumoId deja de ser un ObjectId y pasa a ser un objeto poblado
  // { _id, nombre }. Llamar .toString() sobre ese objeto NO da el ID real,
  // da "[object Object]" — y eso rompía silenciosamente el descuento de
  // stock al anular (incrementStock recibía un ID inválido y no encontraba
  // el insumo, sin lanzar error).
  //
  // Esta versión detecta si insumoId/productoId vienen poblados (son objetos
  // con _id) y extrae el ID real desde ahí; si no están poblados, siguen
  // siendo ObjectId planos y el .toString() de siempre funciona normal.
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;

    const extractId = (val) => {
      if (!val) return null;
      if (typeof val === "object" && val._id) return val._id.toString(); // poblado
      return val.toString();                                              // ObjectId plano
    };

    return new PurchaseDetail({
      ...obj,
      id: obj._id.toString(),
      compraId: extractId(obj.compraId),
      productoId: extractId(obj.productoId),
      insumoId: extractId(obj.insumoId),
    });
  }

  async findAll(filters = {}) {
    const query = {};
    // Acepta compraId o purchaseId (compatibilidad con el frontend)
    if (filters.compraId) query.compraId = filters.compraId;
    if (filters.purchaseId) query.compraId = filters.purchaseId;

    const docs = await PurchaseDetailModel
      .find(query)
      .populate("productoId", "nombre")
      .populate("insumoId", "nombre")
      .sort({ createdAt: 1 });

    return docs.map((d) => this._toEntity(d));
  }

  async findById(id) {
    const doc = await PurchaseDetailModel
      .findById(id)
      .populate("productoId", "nombre")
      .populate("insumoId", "nombre")
      .catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await PurchaseDetailModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await PurchaseDetailModel
      .findByIdAndUpdate(id, changes, { new: true })
      .catch(() => null);
    return this._toEntity(doc);
  }

  async deleteByCompraId(compraId) {
    await PurchaseDetailModel.deleteMany({ compraId });
  }

  async delete(id) {
    const result = await PurchaseDetailModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = PurchaseDetailRepository;