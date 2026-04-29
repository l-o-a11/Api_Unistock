// domain/entities/Sede.js
// Entidad pura del dominio — sin dependencias externas.
// Define la forma canónica de una Sede y las reglas que le pertenecen.

class Sede {
    constructor({
        id,
        nombre,
        ciudad,
        barrio,
        direccion,
        telefono,
        estado = true,
    }) {
        this.id = id;
        this.nombre = nombre;
        this.ciudad = ciudad;
        this.barrio = barrio;
        this.direccion = direccion;
        this.telefono = telefono;
        this.estado = estado;
    }

    // Devuelve el objeto público
    toPublic() {
        return { ...this };
    }
}

module.exports = Sede;