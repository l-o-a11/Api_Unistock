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
    if (filters.fecha_desde || filters.fecha_hasta) {
      query.fecha_entrega = {};
      if (filters.fecha_desde) query.fecha_entrega.$gte = new Date(filters.fecha_desde);
      if (filters.fecha_hasta) query.fecha_entrega.$lte = new Date(filters.fecha_hasta);
    }

    const requestedLimit = Number.parseInt(filters.limit, 10);
    const limit = Number.isFinite(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 100)
      : 50;
    const requestedPage = Number.parseInt(filters.page, 10);
    const page = Number.isFinite(requestedPage) ? Math.max(requestedPage, 1) : 1;
    const skip = (page - 1) * limit;

    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'productionorderdetails',
          let: { orderId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ['$id_orden', '$$orderId'] },
                    { $eq: [{ $toString: '$id_orden' }, { $toString: '$$orderId' }] },
                  ],
                },
              },
            },
          ],
          as: 'details',
        },
      },
      {
        $addFields: {
          detailsCount: { $size: '$details' },
          totalQty: { $ifNull: [{ $sum: '$details.cantidad' }, 0] },
          firstColor: {
            $ifNull: [
              {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: '$details.color',
                      cond: { $ne: ['$$this', ''] },
                    },
                  },
                  0,
                ],
              },
              '',
            ],
          },
          firstRef: { $ifNull: [{ $arrayElemAt: ['$details.id_producto', 0] }, ''] },
        },
      },
      {
        $project: {
          details: 0,
        },
      },
      { $sort: { createdAt: 1, _id: 1 } },
      { $skip: skip },
      { $limit: limit },
    ];

    const [docs, total] = await Promise.all([
      ProductionOrderModel.aggregate(pipeline),
      ProductionOrderModel.countDocuments(query),
    ]);

    return {
      data: docs.map((d) => this._toEntity(d)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
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
      .findByIdAndUpdate(id, changes, { returnDocument: 'after', runValidators: true });
    return this._toEntity(doc);
  }

  /**
   * Anula una orden: pone estado "Anulada", guarda motivo
   * y agrega entrada al historial.
   */
  async anular(id, motivo, id_usuario, user) {
    const historialEntry = {
      estado: "Anulada",
      fecha: new Date(),
      id_usuario: id_usuario || null,
      user: user || null,
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
        { returnDocument: 'after' },
      )
      .catch(() => null);
    return this._toEntity(doc);
  }

  /**
   * Cambia el estado de la orden y registra la transición en el historial.
   */
  /**
   * ✅ Agrega una entrada al historial SIN cambiar el estado actual de la orden.
   * Se usa para registrar acciones como agregar/editar/eliminar artículos del
   * detalle — antes estas acciones no dejaban ningún rastro en el historial.
   */
  async agregarHistorial(id, motivo, id_usuario, user, estadoActualParaRegistro) {
    const historialEntry = {
      estado: estadoActualParaRegistro || null,
      fecha: new Date(),
      id_usuario: id_usuario || null,
      user: user || null,
      motivo: motivo || null,
    };
    const doc = await ProductionOrderModel
      .findByIdAndUpdate(
        id,
        { $push: { historial: historialEntry } },
        { returnDocument: 'after' },
      )
      .catch(() => null);
    return this._toEntity(doc);
  }

  async cambiarEstado(id, nuevoEstado, id_usuario, user, extra = {}) {
    const historialEntry = {
      estado: nuevoEstado,
      fecha: new Date(),
      id_usuario: id_usuario || null,
      user: user || null,
      motivo: null,
    };

    const updateDoc = { estado: nuevoEstado, ...extra, $push: { historial: historialEntry } };

    const doc = await ProductionOrderModel
      .findByIdAndUpdate(
        id,
        updateDoc,
        { returnDocument: 'after', runValidators: true },
      )
      .catch(() => null);
    return this._toEntity(doc);
  }

  /**
   * findAlertas — Devuelve tres grupos de alertas:
   *   vencidas        — fecha_entrega ya pasó y la orden no está anulada
   *   proximas_vencer — vencen en los próximos 3 días
   *   en_espera_larga — llevan más de 7 días en el mismo estado sin avanzar
   */
  async findAlertas() {
    const ahora = new Date();
    const en3dias = new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000);
    const hace7dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [vencidas, proximasVencer, todasActivas] = await Promise.all([
      ProductionOrderModel.find({
        estado: { $nin: ["Anulada", "Enviado"] },
        fecha_entrega: { $lt: ahora },
      }).lean(),

      ProductionOrderModel.find({
        estado: { $nin: ["Anulada", "Enviado"] },
        fecha_entrega: { $gte: ahora, $lte: en3dias },
      }).lean(),

      ProductionOrderModel.find({
        estado: { $nin: ["Anulada", "Enviado"] },
      }).lean(),
    ]);

    const enEsperaLarga = todasActivas.filter((orden) => {
      if (!orden.historial || orden.historial.length === 0) {
        return orden.createdAt && new Date(orden.createdAt) < hace7dias;
      }
      const ultimoCambio = orden.historial[orden.historial.length - 1];
      return ultimoCambio.fecha && new Date(ultimoCambio.fecha) < hace7dias;
    });

    const toPlain = (doc) => {
      const id = doc._id ? doc._id.toString() : doc.id;
      return {
        id,
        numero_orden: doc.numero_orden,
        cliente: doc.cliente,
        estado: doc.estado,
        fecha_entrega: doc.fecha_entrega,
        historial: doc.historial || [],
        ultimo_cambio: doc.historial?.length
          ? doc.historial[doc.historial.length - 1]
          : null,
      };
    };

    return {
      vencidas:       vencidas.map(toPlain),
      proximas_vencer: proximasVencer.map(toPlain),
      en_espera_larga: enEsperaLarga.map(toPlain),
    };
  }

  /**
   * findParaCalendario — Devuelve órdenes activas para el calendario.
   */
  async find(query = {}, projection = null) {
    const docs = await ProductionOrderModel.find(query).select(projection).lean();
    return docs.map((d) => this._toEntity(d));
  }

  async findParaCalendario(desde, hasta) {
    const query = {
      estado: { $nin: ["Anulada"] },
    };

    if (desde || hasta) {
      query.fecha_entrega = {};
      if (desde) query.fecha_entrega.$gte = new Date(desde);
      if (hasta) query.fecha_entrega.$lte = new Date(hasta);
    }

    const docs = await ProductionOrderModel.find(query).lean();

    return docs.map((doc) => {
      const id = doc._id ? doc._id.toString() : doc.id;
      const ultimoCambio = doc.historial?.length
        ? doc.historial[doc.historial.length - 1]
        : null;
      return {
        id,
        numero_orden: doc.numero_orden,
        cliente: doc.cliente,
        estado: doc.estado,
        fecha_entrega: doc.fecha_entrega,
        ultimo_cambio: ultimoCambio,
      };
    });
  }
}

module.exports = ProductionRepository;
