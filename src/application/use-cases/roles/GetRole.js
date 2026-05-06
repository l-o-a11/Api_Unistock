// application/use-cases/roles/GetRole.js

class GetRole {
  constructor(roleRepository) {
    this.roleRepository = roleRepository;
  }

  async execute(filters = {}) {
    return this.roleRepository.findAll(filters);
  }
}

module.exports = GetRole;
