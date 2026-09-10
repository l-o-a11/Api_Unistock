const GetUserById = require("../../../../src/application/use-cases/users/GetUserById");

describe("GetUserById", () => {
  let userRepository;
  let getUserById;

  beforeEach(() => {
    userRepository = { findById: jest.fn() };
    getUserById = new GetUserById(userRepository);
  });

  test("rama: usuario no encontrado -> 404", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(getUserById.execute("noexiste")).rejects.toMatchObject({
      message: "Usuario no encontrado",
      statusCode: 404,
    });
  });

  test("camino feliz: devuelve el usuario en su forma pública", async () => {
    userRepository.findById.mockResolvedValue({
      toPublic: () => ({ id: "u1", correo: "x@unistock.com" }),
    });

    const result = await getUserById.execute("u1");
    expect(result).toEqual({ id: "u1", correo: "x@unistock.com" });
  });
});
