// application/use-cases/sites/GetSites.js

class GetSites {
  constructor(siteRepository) {
    this.repo = siteRepository;
  }

  // async + await: el repositorio hace consultas a MongoDB
  async execute(filters = {}) {
    return this.repo.findAll(filters);
  }
}

module.exports = GetSites;