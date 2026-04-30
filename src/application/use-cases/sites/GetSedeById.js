// application/use-cases/sites/GetSiteById.js

class GetSiteById {
  constructor(siteRepository) {
    this.siteRepository = siteRepository;
  }

  execute(id) {
    const site = this.siteRepository.findById(id);
    if (!site) {
      const error = new Error("Sede no encontrada");
      error.statusCode = 404;
      throw error;
    }
    return site;
  }
}

module.exports = GetSiteById;