// application/use-cases/roles/GetRol.js

class GetRol {
    constructor(rolRepository) {
        this.rolRepository = rolRepository;
    }

    execute(filters = {}) {
        return this.rolRepository.findAll(filters);
    }
}

module.exports = GetRol;