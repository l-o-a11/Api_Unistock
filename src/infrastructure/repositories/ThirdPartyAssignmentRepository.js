// infrastructure/repositories/ThirdPartyAssignmentRepository.js
const { store } = require("../../Config/database");
const ThirdPartyAssignment = require("../../domain/entities/ThirdPartyAssignment");

class ThirdPartyAssignmentRepository {
  _toEntity(raw) {
    return raw ? new ThirdPartyAssignment(raw) : null;
  }

  findAll(filters = {}) {
    let result = store.thirdPartyAssignments();

    if (filters.id_orden) {
      result = result.filter((tpa) => tpa.id_orden === parseInt(filters.id_orden));
    }
    if (filters.id_tercero) {
      result = result.filter((tpa) => tpa.id_tercero === parseInt(filters.id_tercero));
    }

    return result.map((tpa) => this._toEntity(tpa));
  }

  findById(id) {
    const raw = store.thirdPartyAssignments().find((tpa) => tpa.id === parseInt(id));
    return this._toEntity(raw);
  }

  create(data) {
    const assignments = store.thirdPartyAssignments();
    const maxId = assignments.length > 0 ? Math.max(...assignments.map(a => a.id)) : 0;
    const newAssignment = {
      id: maxId + 1,
      fecha: new Date(),
      ...data,
    };
    assignments.push(newAssignment);
    return this._toEntity(newAssignment);
  }

  update(id, data) {
    const assignments = store.thirdPartyAssignments();
    const index = assignments.findIndex((tpa) => tpa.id === parseInt(id));
    if (index === -1) return null;

    assignments[index] = { ...assignments[index], ...data };
    return this._toEntity(assignments[index]);
  }

  delete(id) {
    const assignments = store.thirdPartyAssignments();
    const index = assignments.findIndex((tpa) => tpa.id === parseInt(id));
    if (index === -1) return false;

    assignments.splice(index, 1);
    return true;
  }
}

module.exports = ThirdPartyAssignmentRepository;
