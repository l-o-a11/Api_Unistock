// infrastructure/repositories/ThirdPartyAssignmentRepository.js
const ThirdPartyAssignmentModel = require("../db/ThirdPartyAssignmentModel");
const ThirdPartyAssignment = require("../../domain/entities/ThirdPartyAssignment");

class ThirdPartyAssignmentRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new ThirdPartyAssignment({ ...obj, id: obj._id.toString() });
  }

  async findAll(filters = {}) {
    const query = {};
    if (filters.id_orden) query.id_orden = filters.id_orden;
    if (filters.id_tercero) query.id_tercero = filters.id_tercero;
    const docs = await ThirdPartyAssignmentModel.find(query);
    return docs.map((d) => this._toEntity(d));
  }


  async findById(id) {
    const doc = await ThirdPartyAssignmentModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await ThirdPartyAssignmentModel.create({ fecha: new Date(), ...data });
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await ThirdPartyAssignmentModel.findByIdAndUpdate(id, changes, { returnDocument: 'after' }).catch(() => null);
    return this._toEntity(doc);
  }

async delete(id) {
    const result = await ThirdPartyAssignmentModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }

  /**
   * Elimina todas las asignaciones de terceros para una orden.
   */
  async deleteByOrder(id_orden) {
    const result = await ThirdPartyAssignmentModel.deleteMany({ id_orden }).catch(() => null);
    return result?.deletedCount ?? 0;
  }
}

module.exports = ThirdPartyAssignmentRepository;
