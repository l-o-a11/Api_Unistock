// application/use-cases/sites/CreateSites.js

class CreateSite {
  constructor(siteRepository) {
    this.repo = siteRepository;
  }

  async execute(data) {
    const { nombre, ciudad, barrio, direccion, telefono, estado = true } = data;

    // 1. Validar campos obligatorios PRIMERO (antes de consultar BD)
    if (!nombre?.trim() || !ciudad?.trim() || !barrio?.trim() || !direccion?.trim() || !telefono) {
      const err = new Error("Todos los campos son requeridos: nombre, ciudad, barrio, direccion, telefono");
      err.statusCode = 400;
      throw err;
    }

    // 2. Unicidad de nombre — con await correcto (el original hacía .findAll().some() sin await → TypeError)
    const existing = await this.repo.findByName(nombre.trim());
    if (existing) {
      const err = new Error(`Ya existe una sede con el nombre "${nombre.trim()}"`);
      err.statusCode = 409;
      throw err;
    }

    // 3. Crear — usa repo.create() (el original usaba repo.save() que ya no existe)
    return this.repo.create({
      nombre:    nombre.trim(),
      ciudad:    ciudad.trim(),
      barrio:    barrio.trim(),
      direccion: direccion.trim(),
      telefono:  String(telefono).trim(),
      estado,
    });
  }
}

module.exports = CreateSite;