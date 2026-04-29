// application/use-cases/purchases/GetPurchase.js

class GetPurchase {
  constructor(purchaseRepository) {
    this.purchaseRepository = purchaseRepository;
  }

  execute(filters = {}) {
    const purchases = this.purchaseRepository.findAll(filters);
    return purchases.map(c => c.toPublic());
  }
}

module.exports = GetPurchase;