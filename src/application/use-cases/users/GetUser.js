class GetUser {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(filters = {}) {
    const users = await this.userRepository.findAll(filters);
    return users.map((u) => u.toPublic());
  }
}

module.exports = GetUser;