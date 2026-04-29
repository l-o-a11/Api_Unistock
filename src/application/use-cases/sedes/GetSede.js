// application/use-cases/sedes/GetSede.js

class GetSede {
  constructor(sedeRepository) {
    this.sedeRepository = sedeRepository;
  }

  execute(filters = {}) {
    return this.sedeRepository.findAll(filters);
  }
}

module.exports = GetSede;