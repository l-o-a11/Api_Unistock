// infrastructures/repositorie/ThirdPartyRepository.js

const ThirdPartyModel      = require('../db/ThirdPartyModel');
const ProductionOrderModel = require('../db/ProductionOrderModel');
const ThirdParty           = require('../../domain/entities/ThirdParty');

const ESTADOS_BLOQUEANTES = ['Diseño', 'Ficha Técnica', 'Corte', 'Compras', 'Producción'];

class ThirdPartyRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new ThirdParty({ ...obj, id: obj._id.toString() });
  }

  async _nextCodigo() {
    const last = await ThirdPartyModel
      .findOne({ codigo: /^TP-\d+$/ })
      .sort({ codigo: -1 })
      .select('codigo');
    if (!last) return 'TP-001';
    const n = parseInt(last.codigo.replace('TP-', ''), 10);
    return `TP-${String(n + 1).padStart(3, '0')}`;
  }

  async findAll(filters = {}) {
    const {
      search, nit, estado,
      page = 1, limit = 10,
      sortBy = 'nombre_empresa', order = 'asc',
    } = filters;

    const query = {};
    if (search) {
      const re = new RegExp(search, 'i');
      query.$or = [
        { nombre_empresa:  re },
        { nombre_contacto: re },
        { nit:             re },
        { codigo:          re },
      ];
    }
    if (nit) query.nit = nit;
    if (estado !== undefined && estado !== '')
      query.estado = estado === 'true' || estado === true;

    const pageNum  = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip     = (pageNum - 1) * limitNum;
    const sortDir  = order === 'desc' ? -1 : 1;

    const [docs, total] = await Promise.all([
      ThirdPartyModel.find(query).sort({ [sortBy]: sortDir }).skip(skip).limit(limitNum),
      ThirdPartyModel.countDocuments(query),
    ]);

    return {
      data:       docs.map((d) => this._toEntity(d)),
      total,
      page:       pageNum,
      limit:      limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findById(id) {
    const doc = await ThirdPartyModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async findByNit(nit) {
    const doc = await ThirdPartyModel.findOne({ nit }).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const codigo = await this._nextCodigo();
    const doc    = await ThirdPartyModel.create({ ...data, codigo });
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const { codigo, ...safeChanges } = changes;
    const doc = await ThirdPartyModel
      .findByIdAndUpdate(id, safeChanges, { returnDocument: 'after', runValidators: true })
      .catch(() => null);
    return this._toEntity(doc);
  }

  async toggleEstado(id) {
    const current = await ThirdPartyModel.findById(id).catch(() => null);
    if (!current) return null;
    const doc = await ThirdPartyModel.findByIdAndUpdate(
      id,
      { estado: !current.estado },
      { returnDocument: 'after' }
    );
    return this._toEntity(doc);
  }

  /** Vincula una orden de producción al tercero (sin duplicar por produccionId) */
  async linkProduccion(id, { orden, fecha, produccionId, cantidad }) {
    // Si ya existe esa produccionId, actualizar cantidad; si no, agregar
    const existing = await ThirdPartyModel.findOne({
      _id: id,
      'producciones.produccionId': produccionId,
    }).catch(() => null);

    let doc;
    if (existing) {
      // Actualizar entrada existente
      doc = await ThirdPartyModel.findOneAndUpdate(
        { _id: id, 'producciones.produccionId': produccionId },
        { $set: { 'producciones.$.cantidad': Number(cantidad) || 0 } },
        { returnDocument: 'after' }
      ).catch(() => null);
    } else {
      // Agregar nueva entrada
      doc = await ThirdPartyModel.findByIdAndUpdate(
        id,
        { $push: { producciones: { orden, fecha, produccionId, cantidad: Number(cantidad) || 0 } } },
        { returnDocument: 'after' }
      ).catch(() => null);
    }
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await ThirdPartyModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }

  async tieneProduccion(id) {
    const doc = await ThirdPartyModel.findById(id).select('producciones').catch(() => null);
    return doc ? doc.producciones.length > 0 : false;
  }

  async tieneProduccionActiva(id) {
    const doc = await ThirdPartyModel.findById(id).select('producciones').catch(() => null);
    if (!doc || !doc.producciones || doc.producciones.length === 0) return false;

    const produccionIds = doc.producciones
      .map((p) => p.produccionId)
      .filter(Boolean);
    if (produccionIds.length === 0) return false;

    const count = await ProductionOrderModel.countDocuments({
      _id: { $in: produccionIds },
      estado: { $in: ESTADOS_BLOQUEANTES },
    }).catch(() => 0);

    return count > 0;
  }
}

module.exports = ThirdPartyRepository;
