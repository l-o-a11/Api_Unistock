// application/use-cases/thirdParties/LinkProduccion.js

class LinkProduccion {
  constructor(repo) { this.repo = repo; }

  async execute(id, { orden, fecha, produccionId, cantidad }) {
    const tercero = await this.repo.findById(id);
    if (!tercero) {
      const err = new Error('Tercero no encontrado');
      err.statusCode = 404;
      throw err;
    }
    if (!orden || !fecha) {
      const err = new Error('Se requieren orden y fecha para vincular la producción');
      err.statusCode = 400;
      throw err;
    }
    return this.repo.linkProduccion(id, { orden, fecha, produccionId, cantidad: Number(cantidad) || 0 });
  }
}

module.exports = LinkProduccion;
