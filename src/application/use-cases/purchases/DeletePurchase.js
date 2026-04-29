// application/use-cases/purchases/DeletePurchase.js

class DeletePurchase {
  constructor(purchaseRepository) {
    this.purchaseRepository = purchaseRepository;
  }

  execute(id) {
    const deleted = this.purchaseRepository.delete(id);
    if (!deleted) {
      const error = new Error("Purchase no encontrada");
      error.statusCode = 404;
      throw error;
    }
  }
}

module.exports = DeletePurchase;