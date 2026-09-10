const GetRoleById = require("../../../../src/application/use-cases/roles/GetRoleById");

describe("GetRoleById", () => {
  let roleRepository;
  let getRoleById;

  beforeEach(() => {
    jest.clearAllMocks();
    roleRepository = { findById: jest.fn() };
    getRoleById = new GetRoleById(roleRepository);
  });

  test("rama: rol no encontrado -> 404", async () => {
    roleRepository.findById.mockResolvedValue(null);

    await expect(getRoleById.execute("rolX")).rejects.toMatchObject({
      message: "Rol no encontrado",
      statusCode: 404,
    });
  });

  test("camino feliz: devuelve el rol encontrado", async () => {
    const role = { id: "rol1", nombre: "Gerente" };
    roleRepository.findById.mockResolvedValue(role);

    const result = await getRoleById.execute("rol1");

    expect(result).toEqual(role);
  });
});
