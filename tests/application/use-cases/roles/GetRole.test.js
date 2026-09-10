const GetRole = require("../../../../src/application/use-cases/roles/GetRole");

describe("GetRole", () => {
  let roleRepository;
  let getRole;

  beforeEach(() => {
    jest.clearAllMocks();
    roleRepository = { findAll: jest.fn() };
    getRole = new GetRole(roleRepository);
  });

  test("rama: sin filtros, usa un objeto vacío por defecto", async () => {
    roleRepository.findAll.mockResolvedValue([]);

    await getRole.execute();

    expect(roleRepository.findAll).toHaveBeenCalledWith({});
  });

  test("camino feliz: devuelve la lista de roles del repositorio", async () => {
    const roles = [{ id: "r1" }, { id: "r2" }];
    roleRepository.findAll.mockResolvedValue(roles);

    const result = await getRole.execute({ estado: true });

    expect(roleRepository.findAll).toHaveBeenCalledWith({ estado: true });
    expect(result).toEqual(roles);
  });
});
