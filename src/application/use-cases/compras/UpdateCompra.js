// application/use-cases/compras/UpdateCompra.js

class UpdateCompra {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  execute(id, data) {
    const { fecha, proveedorId, total, estado } = data;

    // Validaciones básicas si es necesario

    const compra = this.compraRepository.update(id, {
      fecha,
      proveedorId: proveedorId ? parseInt(proveedorId) : undefined,
      total: total !== undefined ? parseFloat(total) : undefined,
      estado,
    });

    if (!compra) {
      const error = new Error("Compra no encontrada");
      error.statusCode = 404;
      throw error;
    }

    return compra.toPublic();
  }
}

module.exports = UpdateCompra;