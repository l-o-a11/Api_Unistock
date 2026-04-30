// application/use-cases/supplyCategories/GetSupplyCategory.js

class GetSupplyCategory {
  constructor(supplyCategoryRepository) {
    this.supplyCategoryRepository = supplyCategoryRepository;
  }

  execute(filters = {}) {
    return this.supplyCategoryRepository.findAll(filters);
  }
}

module.exports = GetSupplyCategory;