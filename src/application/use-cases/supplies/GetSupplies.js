// application/use-cases/supplies/GetSupply.js

class GetSupply {
  constructor(supplyRepository) {
    this.supplyRepository = supplyRepository;
  }

  execute(filters = {}) {
    const supplies = this.supplyRepository.findAll(filters);
    return supplies.map((s) => s.toPublic());
  }
}