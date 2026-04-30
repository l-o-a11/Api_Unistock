// application/use-cases/sites/GetSite.js

class GetSite {
  constructor(siteRepository) {
    this.siteRepository = siteRepository;
  }

  execute(filters = {}) {
    return this.siteRepository.findAll(filters);
  }
}

module.exports = GetSite;