// application/use-cases/sites/GetSedeById.js

class GetSiteById {
  constructor(siteRepository) {
    this.repo = siteRepository;
  }

  // async + await: el repositorio hace consultas a MongoDB
  async execute(id) {
    const site = await this.repo.findById(id);
    if (!site) {
      const err = new Error("Sede no encontrada");
      err.statusCode = 404;
      throw err;
    }
    return site;
  }
}

module.exports = GetSiteById;
