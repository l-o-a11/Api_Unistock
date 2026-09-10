const GetUser = require("../../../../src/application/use-cases/users/GetUser");

describe("GetUser", () => {
  test("devuelve la lista de usuarios ya convertidos a su forma pública (sin password)", async () => {
    const userRepository = {
      findAll: jest.fn().mockResolvedValue([
        { toPublic: () => ({ id: "1", correo: "a@x.com" }) },
        { toPublic: () => ({ id: "2", correo: "b@x.com" }) },
      ]),
    };
    const getUser = new GetUser(userRepository);

    const result = await getUser.execute({ search: "a" });

    expect(userRepository.findAll).toHaveBeenCalledWith({ search: "a" });
    expect(result).toEqual([
      { id: "1", correo: "a@x.com" },
      { id: "2", correo: "b@x.com" },
    ]);
  });

  test("sin filtros, usa objeto vacío por defecto y devuelve lista vacía si no hay usuarios", async () => {
    const userRepository = { findAll: jest.fn().mockResolvedValue([]) };
    const getUser = new GetUser(userRepository);

    const result = await getUser.execute();

    expect(userRepository.findAll).toHaveBeenCalledWith({});
    expect(result).toEqual([]);
  });
});
