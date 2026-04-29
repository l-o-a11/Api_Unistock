// infrastructure/repositories/SedeRepository.js
// Traduce operaciones de dominio a operaciones sobre la fuente de datos.
// Si cambias de BD, solo cambias este archivo.

const { store } = require("../../Config/database");
const Sede = require("../../domain/entities/Sede");

class SedeRepository {
    // Convierte un objeto plano del store en una entidad Sede
    _toEntity(raw) {
        return raw ? new Sede(raw) : null;
    }

    findAll(filters = {}) {
        let result = store.sedes();

        if (filters.search) {
            const term = filters.search.toLowerCase();
            result = result.filter(
                (s) =>
                    s.nombre.toLowerCase().includes(term) ||
                    s.ciudad.toLowerCase().includes(term) ||
                    s.barrio.toLowerCase().includes(term),
            );
        }
        if (filters.estado !== undefined) {
            const active = filters.estado === "true" || filters.estado === true;
            result = result.filter((s) => s.estado === active);
        }

        return result.map((s) => this._toEntity(s));
    }

    findById(id) {
        const raw = store.sedes().find((s) => s.id === parseInt(id));
        return this._toEntity(raw);
    }

    save(data) {
        const newRaw = { id: store.nextId(), ...data };
        store.sedes().push(newRaw);
        return this._toEntity(newRaw);
    }

    update(id, changes) {
        const list = store.sedes();
        const idx = list.findIndex((s) => s.id === parseInt(id));
        if (idx === -1) return null;
        list[idx] = { ...list[idx], ...changes };
        return this._toEntity(list[idx]);
    }

    delete(id) {
        const list = store.sedes();
        const idx = list.findIndex((s) => s.id === parseInt(id));
        if (idx === -1) return false;
        list.splice(idx, 1);
        return true;
    }
}

module.exports = SedeRepository;