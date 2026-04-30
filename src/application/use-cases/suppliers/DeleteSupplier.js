// application/use-cases/suppliers/DeleteUser.js

class DeleteSupplier {
  constructor(supplierRepository) {
    this.supplierRepository = supplierRepository;
  }

  execute(id) {
    const supplier = this.supplierRepository.findById(id);
    if (!supplier) {
      const error = new Error("Proveedor no encontrado");
      error.statusCode = 404;
      throw error;
    }

    // Protección: no eliminar al único administrador activo
    if (supplier.isLastActiveAdmin(this.supplierRepository.countActiveAdmins())) {
      const error = new Error(
        "No se puede eliminar el único administrador activo del sistema",
      );
      error.statusCode = 422;
      throw error;
    }

    this.supplierRepository.delete(id);
    return true;
  }
}