// application/use-cases/suppliers/GetUserById.js

class GetSupplierById {
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

    return supplier.toPublic();
  }
}