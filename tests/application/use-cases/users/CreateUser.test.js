const CreateUser = require("../../../../src/application/use-cases/users/CreateUser");

jest.mock("../../../../src/infrastructure/security/password_encrypter", () => ({
  hash: jest.fn().mockResolvedValue("hashed_pw"),
}));
jest.mock("../../../../src/shared/utils/emailService", () => ({
  sendWelcomeEmail: jest.fn().mockResolvedValue(true),
}));
jest.mock("../../../../src/shared/utils/generatePassword", () => ({
  generatePassword: jest.fn().mockReturnValue("Temporal1*"),
}));

const { sendWelcomeEmail } = require("../../../../src/shared/utils/emailService");

function baseData(overrides = {}) {
  return {
    tipoDocumento: "CC",
    numeroDocumento: "123456",
    nombreCompleto: "  Nuevo Empleado  ",
    correo: "nuevo@unistock.com",
    rolId: "rolEmpleado",
    sedeId: "sedeA",
    cargo: "Operario",
    ...overrides,
  };
}

describe("CreateUser", () => {
  let userRepository;
  let roleRepository;
  let siteRepository;
  let createUser;
  const gerenteCreador = { rolNombre: "Gerente", sedeId: "sedeA" };

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByDocument: jest.fn().mockResolvedValue(null),
      countActiveByRoleName: jest.fn().mockResolvedValue(0),
      save: jest.fn().mockImplementation(async (data) => ({
        toObject: () => ({ ...data, _id: "newId" }),
      })),
    };
    roleRepository = {
      findById: jest.fn().mockResolvedValue({ nombre: "Empleado", estado: true }),
    };
    siteRepository = {
      findById: jest.fn().mockResolvedValue({ estado: true }),
    };
    createUser = new CreateUser(userRepository, roleRepository, siteRepository);
  });

  test("rama: usuario no-Gerente intenta crear en otra sede -> 403", async () => {
    const admin = { rolNombre: "Administrador", sedeId: "sedeA" };
    await expect(
      createUser.execute(baseData({ sedeId: "sedeB" }), admin),
    ).rejects.toMatchObject({
      message: "Solo puedes crear usuarios de tu sede",
      statusCode: 403,
    });
  });

  test("rama: Gerente puede crear en cualquier sede (bypass del chequeo de sede)", async () => {
    userRepository.findByEmail.mockResolvedValue(null);
    const result = await createUser.execute(
      baseData({ sedeId: "sedeOtra" }),
      gerenteCreador,
    );
    expect(result).not.toHaveProperty("password");
  });

  test("rama: correo ya registrado -> 409", async () => {
    userRepository.findByEmail.mockResolvedValue({ id: "existente" });

    await expect(
      createUser.execute(baseData(), gerenteCreador),
    ).rejects.toMatchObject({
      message: "Ya existe un usuario con ese correo",
      statusCode: 409,
    });
  });

  test("rama: documento ya registrado -> 409", async () => {
    userRepository.findByDocument.mockResolvedValue({ id: "existente" });

    await expect(
      createUser.execute(baseData(), gerenteCreador),
    ).rejects.toMatchObject({
      message: "Ya existe un usuario con ese número de documento",
      statusCode: 409,
    });
  });

  test("rama: rol inválido o inactivo -> 422", async () => {
    roleRepository.findById.mockResolvedValue({ nombre: "Empleado", estado: false });

    await expect(
      createUser.execute(baseData(), gerenteCreador),
    ).rejects.toMatchObject({
      message: "Rol inválido o inactivo",
      statusCode: 422,
    });
  });

  test("rama: ya existe un Gerente activo -> 409", async () => {
    roleRepository.findById.mockResolvedValue({ nombre: "Gerente", estado: true });
    userRepository.countActiveByRoleName.mockResolvedValue(1);

    await expect(
      createUser.execute(baseData({ rolId: "rolGerente" }), gerenteCreador),
    ).rejects.toMatchObject({
      message: "Ya existe un Gerente activo. Solo puede haber un Gerente a la vez.",
      statusCode: 409,
    });
  });

  test("rama: sede inválida o inactiva -> 422", async () => {
    siteRepository.findById.mockResolvedValue({ estado: false });

    await expect(
      createUser.execute(baseData(), gerenteCreador),
    ).rejects.toMatchObject({
      message: "Sede inválida o inactiva",
      statusCode: 422,
    });
  });

  test("rama: si falla el envío del correo de bienvenida, igual crea el usuario", async () => {
    sendWelcomeEmail.mockRejectedValueOnce(new Error("SMTP caído"));

    const result = await createUser.execute(baseData(), gerenteCreador);
    expect(result).not.toHaveProperty("password");
  });

  test("camino feliz: crea el usuario, hashea password, normaliza cargos y no expone el hash", async () => {
    const result = await createUser.execute(
      baseData({ cargo: ["Operario", "Operario", "  Corte  "] }),
      gerenteCreador,
    );

    expect(userRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        nombreCompleto: "Nuevo Empleado", // trim aplicado
        password: "hashed_pw",
        estado: true,
        cargo: ["Operario", "Corte"], // deduplicado y trimeado
      }),
    );
    expect(result).not.toHaveProperty("password");
    expect(sendWelcomeEmail).toHaveBeenCalled();
  });
});
