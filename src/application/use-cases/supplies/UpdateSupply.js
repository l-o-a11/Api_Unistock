// application/use-cases/supplies/UpdateSupply.js

class UpdateSupply {
  constructor(supplyRepository, supplyCategoryRepository) {
    this.supplyRepository         = supplyRepository;
    this.supplyCategoryRepository = supplyCategoryRepository;
  }

  async execute(id, data) {
    const existing = await this.supplyRepository.findById(id);
    if (!existing) {
      const err = new Error('Insumo no encontrado');
      err.statusCode = 404;
      throw err;
    }

    const {
      nombre,
      categoria,
      valor_medida,
      medida,
      imagenes_Url,
      stock,
      propiedades,
    } = data;

    // ── Validaciones condicionales ─────────────────────────────────────────
    if (valor_medida !== undefined && parseFloat(valor_medida) < 0) {
      const err = new Error('El valor de medida no puede ser negativo');
      err.statusCode = 400;
      throw err;
    }

    if (stock !== undefined && parseFloat(stock) < 0) {
      const err = new Error('El stock no puede ser negativo');
      err.statusCode = 400;
      throw err;
    }

    // FIX: imagenes_Url ya no es obligatorio en update
    if (imagenes_Url !== undefined && !Array.isArray(imagenes_Url)) {
      const err = new Error('imagenes_Url debe ser un arreglo');
      err.statusCode = 400;
      throw err;
    }

    // ── Unicidad de nombre (si cambia) ─────────────────────────────────────
    if (nombre && nombre.trim().toLowerCase() !== existing.nombre.toLowerCase()) {
      const byName = await this.supplyRepository.findByName(nombre.trim());
      if (byName && byName.id !== id) {
        const err = new Error(`Ya existe otro insumo con el nombre "${nombre.trim()}"`);
        err.statusCode = 409;
        throw err;
      }
    }

    // ── Verificar categoría si cambia ──────────────────────────────────────
    if (categoria && categoria.toString() !== existing.categoria?.toString()) {
      const cat = await this.supplyCategoryRepository.findById(categoria);
      if (!cat) {
        const err = new Error('La categoría indicada no existe');
        err.statusCode = 404;
        throw err;
      }
      if (!cat.estaActiva()) {
        const err = new Error('La categoría indicada está inactiva');
        err.statusCode = 422;
        throw err;
      }
    }

    // ── Construir cambios ──────────────────────────────────────────────────
    const changes = {};
    if (nombre        != null) changes.nombre       = nombre.trim();
    if (categoria     != null) changes.categoria    = categoria;
    if (valor_medida  != null) changes.valor_medida = parseFloat(valor_medida);
    if (medida        != null) changes.medida       = medida.trim();
    if (imagenes_Url  != null) changes.imagenes_Url = imagenes_Url.filter(Boolean);
    if (stock         != null) changes.stock        = parseInt(stock) || 0;

    // FIX: normalizar propiedades — acepta clave o propiedadId
    if (propiedades != null) {
      changes.propiedades = Array.isArray(propiedades)
        ? propiedades.map((p) => ({
            clave: String(p.clave ?? p.propiedadId ?? ''),
            valor: p.valor ?? '',
          })).filter((p) => p.clave)
        : [];
    }

    const updated = await this.supplyRepository.update(id, changes);
    return updated.toJSON();
  }
}

module.exports = UpdateSupply;
