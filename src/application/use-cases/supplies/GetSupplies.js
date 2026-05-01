// application/use-cases/supplies/GetSupplies.js

class GetSupplies {
  constructor(supplyRepository) {
    this.supplyRepository = supplyRepository;
  }

  async execute(filters = {}) {
    const supplies = await this.supplyRepository.findAll(filters);
    return supplies.map((s) => s.toPublic());
  }
}

module.exports = GetSupplies;
