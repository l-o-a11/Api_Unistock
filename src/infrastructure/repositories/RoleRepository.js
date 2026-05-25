// infrastructure/repositories/RoleRepository.js
const RoleModel = require("../db/RoleModel");
const Role = require("../../domain/entities/Role");

class RoleRepository {
  _toEntity(doc) {
    if (!doc) return null;
    const obj = doc.toObject ? doc.toObject() : doc;
    return new Role({ ...obj, id: obj._id.toString() });
  }

  /**
   * Devuelve roles con filtros opcionales y paginación.
   * Si no se pasan page/limit, devuelve todos sin paginar.
   */
  async findAll(filters = {}) {
    const {
      search,
      estado,
      page,
      limit = 10,
      sortBy = "nombre",
      order = "asc",
    } = filters;

    const query = {};

    if (search) {
      const re = new RegExp(search, "i");
      query.$or = [{ nombre: re }, { descripcion: re }];
    }

    if (estado !== undefined && estado !== "") {
      query.estado = estado === "true" || estado === true;
    }

    const sortDir = order === "desc" ? -1 : 1;

    // Sin paginación: devuelve array plano
    if (!page) {
      const docs = await RoleModel.find(query).sort({ [sortBy]: sortDir });
      return docs.map((d) => this._toEntity(d));
    }

    // Con paginación
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [docs, total] = await Promise.all([
      RoleModel.find(query).sort({ [sortBy]: sortDir }).skip(skip).limit(limitNum),
      RoleModel.countDocuments(query),
    ]);

    return {
      data: docs.map((d) => this._toEntity(d)),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findById(id) {
    const doc = await RoleModel.findById(id).catch(() => null);
    return this._toEntity(doc);
  }

  async findByName(nombre) {
    const doc = await RoleModel.findOne({ nombre }).catch(() => null);
    return this._toEntity(doc);
  }

  async create(data) {
    const doc = await RoleModel.create(data);
    return this._toEntity(doc);
  }

  async update(id, changes) {
    const doc = await RoleModel.findByIdAndUpdate(id, changes, {
      new: true,
      runValidators: true,
    }).catch(() => null);
    return this._toEntity(doc);
  }

  async toggleEstado(id) {
    const current = await RoleModel.findById(id).catch(() => null);
    if (!current) return null;
    const doc = await RoleModel.findByIdAndUpdate(
      id,
      { estado: !current.estado },
      { new: true }
    );
    return this._toEntity(doc);
  }

  async delete(id) {
    const result = await RoleModel.findByIdAndDelete(id).catch(() => null);
    return !!result;
  }
}

module.exports = RoleRepository;