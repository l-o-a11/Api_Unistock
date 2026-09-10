const CreateRole = require("../../../../src/application/use-cases/roles/CreateRole");

jest.mock("../../../../src/shared/utils/rolePermissionValidator", () => ({
  validatePermissions: jest.fn(),
}));
const { validatePermissions } = require("../../../../src/shared/utils/rolePermissionValidator");

function baseData(overrides = {}) {
  return {
    nombre: "Supervisor",
    descripcion: "Rol de supervisión",
    permisos: [{ modulo: "usuarios", privilegios: ["ver"] }],
    ...overrides,
  };
}

describe("CreateRole", () => {
  let roleRepository;
  let moduleRepository;
  let privilegeRepository;
  let createRole;

  beforeEach(() => {
    jest.clearAllMocks();
    roleRepository = {
      findByName: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: "rol1", nombre: "Supervisor" }),
    };
    moduleRepository = {};
    privilegeRepository = {};
    validatePermissions.mockResolvedValue([{ modulo: "usuarios", privilegios: ["ver"] }]);
    createRole = new CreateRole(roleRepository, moduleRepository, privilegeRepository);
  });

  test("rama: nombre ausente -> 422", async () => {
    await expect(createRole.execute(baseData({ nombre: undefined }))).rejects.toMatchObject({
      message: "Nombre es requerido",
      statusCode: 422,
    });
  });

  test("rama: nombre solo espacios -> 422", async () => {
    await expect(createRole.execute(baseData({ nombre: "   " }))).rejects.toMatchObject({
      message: "Nombre es requerido",
      statusCode: 422,
    });
  });

  test("rama: nombre no es un string -> 422", async () => {
    await expect(createRole.execute(baseData({ nombre: 123 }))).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  test("rama: nombre con caracteres inválidos -> 422", async () => {
    await expect(createRole.execute(baseData({ nombre: "Super_Visor1" }))).rejects.toMatchObject({
      message: "El nombre solo puede contener letras y espacios",
      statusCode: 422,
    });
  });

  test("rama: ya existe un rol con ese nombre -> 409", async () => {
    roleRepository.findByName.mockResolvedValue({ id: "otro" });

    await expect(createRole.execute(baseData())).rejects.toMatchObject({
      message: "Ya existe un rol con ese nombre",
      statusCode: 409,
    });
  });

  test("camino feliz: crea el rol con nombre trimeado y permisos validados", async () => {
    const result = await createRole.execute(baseData({ nombre: "  Supervisor  " }));

    expect(roleRepository.findByName).toHaveBeenCalledWith("Supervisor");
    expect(validatePermissions).toHaveBeenCalledWith(
      baseData().permisos,
      moduleRepository,
      privilegeRepository,
    );
    expect(roleRepository.create).toHaveBeenCalledWith({
      nombre: "Supervisor",
      permisos: [{ modulo: "usuarios", privilegios: ["ver"] }],
      estado: true,
      descripcion: "Rol de supervisión",
    });
    expect(result).toEqual({ id: "rol1", nombre: "Supervisor" });
  });

  test("rama: sin descripción, no se incluye en el objeto guardado", async () => {
    await createRole.execute(baseData({ descripcion: undefined }));

    expect(roleRepository.create).toHaveBeenCalledWith(
      expect.not.objectContaining({ descripcion: expect.anything() }),
    );
  });

  test("rama: sin permisos, usa arreglo vacío por defecto", async () => {
    await createRole.execute(baseData({ permisos: undefined }));

    expect(validatePermissions).toHaveBeenCalledWith([], moduleRepository, privilegeRepository);
  });

  test("rama: estado explícito en false se respeta", async () => {
    await createRole.execute(baseData({ estado: false }));

    expect(roleRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ estado: false }),
    );
  });

  test("rama: si validatePermissions rechaza, el error se propaga", async () => {
    const err = new Error("Módulo inválido");
    err.statusCode = 422;
    validatePermissions.mockRejectedValue(err);

    await expect(createRole.execute(baseData())).rejects.toMatchObject({
      message: "Módulo inválido",
      statusCode: 422,
    });
  });
});
