// application/use-cases/purchases/GetPurchaseById.js

class GetPurchaseById {
  constructor(purchaseRepository) {
    this.purchaseRepository = purchaseRepository;
  }

  execute(id) {
    const purchase = this.purchaseRepository.findById(id);
    if (!purchase) {
      const error = new Error("Purchase no encontrada");
      error.statusCode = 404;
      throw error;
    }
    return purchase.toPublic();
  }
}

module.exports = GetPurchaseById;