// application/use-cases/suppliers/GetUser.js
// Caso de uso: listar proveedors con filtros opcionales

class GetSupplier {
  constructor(supplierRepository) {
    this.supplierRepository = supplierRepository;
  }

  execute(filters = {}) {
    const suppliers = this.supplierRepository.findAll(filters);
    return suppliers.map((u) => u.toPublic());
  }
}