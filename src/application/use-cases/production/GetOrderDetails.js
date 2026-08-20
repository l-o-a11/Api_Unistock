// ─────────────────────────────────────────────────────────────────────────────
// src/application/use-cases/production/GetOrderDetails.js
// ─────────────────────────────────────────────────────────────────────────────

class GetOrderDetails {
  /**
   * @param {ProductionOrderDetailRepository} detailRepository
   */
  constructor(detailRepository) {
    this.detailRepo = detailRepository;
  }

  /**
   * @param {object} filters  - Ej: { id_orden: "abc123", estado: true }
   * @returns {Promise<Array>}
   */
  async execute(filters = {}) {
    const details = await this.detailRepo.findAll(filters);
    return details.map((d) => d.toJSON());
  }
}

module.exports = GetOrderDetails;
