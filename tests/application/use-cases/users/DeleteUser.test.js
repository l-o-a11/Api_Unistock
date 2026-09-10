const DeleteUser = require("../../../../src/application/use-cases/users/DeleteUser");

function makeUser({ isLastAdmin = false } = {}) {
  return {
    id: "u1",
    isLastActiveAdmin: jest.fn().mockReturnValue(isLastAdmin),
  };
}

describe("DeleteUser", () => {
  let userRepository;
  let productionRepository;
  let deleteUser;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = {
      findById: jest.fn(),
      countActiveAdmins: jest.fn().mockResolvedValue(2),
      delete: jest.fn().mockResolvedValue(true),
    };
    productionRepository = {
      countActiveByEmployee: jest.fn().mockResolvedValue(0),
    };
    deleteUser = new DeleteUser(userRepository, productionRepository);
  });

  test("rama: usuario no encontrado -> 404", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(deleteUser.execute("u1")).rejects.toMatchObject({
      message: "Usuario no encontrado",
      statusCode: 404,
    });
  });

  test("rama: es el único administrador activo -> 422, no elimina", async () => {
    userRepository.findById.mockResolvedValue(makeUser({ isLastAdmin: true }));

    await expect(deleteUser.execute("u1")).rejects.toMatchObject({
      message: "No se puede eliminar el único administrador activo del sistema",
      statusCode: 422,
    });
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  test("rama: tiene producción activa asignada -> 422, no elimina", async () => {
    userRepository.findById.mockResolvedValue(makeUser());
    productionRepository.countActiveByEmployee.mockResolvedValue(3);

    await expect(deleteUser.execute("u1")).rejects.toMatchObject({
      message: expect.stringContaining("3 orden(es)"),
      statusCode: 422,
    });
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  test("rama: sin productionRepository inyectado -> se salta esa validación", async () => {
    userRepository.findById.mockResolvedValue(makeUser());
    const deleteUserSinProduccion = new DeleteUser(userRepository, null);

    const result = await deleteUserSinProduccion.execute("u1");
    expect(result).toBe(true);
    expect(userRepository.delete).toHaveBeenCalledWith("u1");
  });

  test("camino feliz: elimina cuando no es último admin y no tiene producción activa", async () => {
    userRepository.findById.mockResolvedValue(makeUser());

    const result = await deleteUser.execute("u1");
    expect(result).toBe(true);
    expect(userRepository.delete).toHaveBeenCalledWith("u1");
  });
});
