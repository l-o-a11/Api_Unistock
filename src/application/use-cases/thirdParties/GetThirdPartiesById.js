// application/use-cases/thirdPartiess/GetUserById.js

class GetUserById {
  constructor(thirdPartiesRepository) {
    this.thirdPartiesRepository = thirdPartiesRepository;
  }

  execute(id) {
    const thirdParties = this.thirdPartiesRepository.findById(id);

    if (!thirdParties) {
      const error = new Error("Tercero no encontrado");
      error.statusCode = 404;
      throw error;
    }

    return thirdParties.toPublic();
  }
}