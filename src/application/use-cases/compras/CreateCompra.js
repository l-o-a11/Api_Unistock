// application/use-cases/compras/CreateCompra.js

class CreateCompra {
  constructor(compraRepository) {
    this.compraRepository = compraRepository;
  }

  async execute(data) {
    const { fecha, proveedorId, total, estado = true } = data;

    // Validaciones básicas
    if (!fecha || !proveedorId || total === undefined) {
      const error = new Error("Datos incompletos para crear la compra");
      error.statusCode = 422;
      throw error;
    }

    // Aquí podrías validar que el proveedor existe, etc.
    // Por ahora, asumimos que sí.

    const compra = this.compraRepository.save({
      fecha,
      proveedorId: parseInt(proveedorId),
      total: parseFloat(total),
      estado,
    });

    return compra.toPublic();
  }
}

module.exports = CreateCompra;