// application/use-cases/purchases/GetPurchaseDetail.js

class GetPurchaseDetail {
  constructor(purchaseDetailRepository) {
    this.purchaseDetailRepository = purchaseDetailRepository;
  }

  execute(filters = {}) {
    const details = this.purchaseDetailRepository.findAll(filters);
    return details.map(d => d.toPublic());
  }
}

module.exports = GetPurchaseDetail;