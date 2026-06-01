// application/use-cases/supplies/CreateSupply.js

class CreateSupply {
  constructor(supplyRepository, supplyCategoryRepository) {
    this.supplyRepository         = supplyRepository;
    this.supplyCategoryRepository = supplyCategoryRepository;
  }

  async execute(data) {
    const {
      nombre,
      categoria,
      valor_medida,
      medida,
      imagenes_Url = [],
      stock        = 0,
      propiedades  = [],
    } = data;

    // ── Validaciones de campos requeridos ──────────────────────────────────
    if (!nombre || !String(nombre).trim()) {
      const err = new Error('El nombre del insumo es obligatorio');
      err.statusCode = 400;
      throw err;
    }

    if (!categoria) {
      const err = new Error('La categoría es obligatoria');
      err.statusCode = 400;
      throw err;
    }

    if (valor_medida === undefined || valor_medida === null || valor_medida === '') {
      const err = new Error('El valor de medida es obligatorio');
      err.statusCode = 400;
      throw err;
    }

    if (parseFloat(valor_medida) < 0) {
      const err = new Error('El valor de medida no puede ser negativo');
      err.statusCode = 400;
      throw err;
    }

    if (!medida || !String(medida).trim()) {
      const err = new Error('La unidad de medida es obligatoria');
      err.statusCode = 400;
      throw err;
    }

    if (typeof stock === 'number' && stock < 0) {
      const err = new Error('El stock no puede ser negativo');
      err.statusCode = 400;
      throw err;
    }

    // ── Verificar que la categoría existe y está activa ───────────────────
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

    // ── Unicidad de nombre ────────────────────────────────────────────────
    const existing = await this.supplyRepository.findByName(nombre.trim());
    if (existing) {
      const err = new Error(`Ya existe un insumo con el nombre "${nombre.trim()}"`);
      err.statusCode = 409;
      throw err;
    }

    // FIX: normalizar propiedades — el frontend puede mandar clave o propiedadId
    const propiedadesNormalizadas = Array.isArray(propiedades)
      ? propiedades.map((p) => ({
          clave: String(p.clave ?? p.propiedadId ?? ''),
          valor: p.valor ?? '',
        })).filter((p) => p.clave)
      : [];

    // FIX: imagenes_Url es opcional — si llega vacío se guarda vacío sin error
    const imagenesNormalizadas = Array.isArray(imagenes_Url)
      ? imagenes_Url.filter(Boolean)
      : [];

    const supply = await this.supplyRepository.create({
      nombre:       nombre.trim(),
      categoria,
      stock:        parseInt(stock) || 0,
      valor_medida: parseFloat(valor_medida),
      medida:       medida.trim(),
      imagenes_Url: imagenesNormalizadas,
      propiedades:  propiedadesNormalizadas,
      estado:       true,
    });

    return supply.toJSON();
  }
}

module.exports = CreateSupply;
