const LoginUser = require("../../../../src/application/use-cases/auth/LoginUser");

// Mockeamos los módulos que LoginUser importa directamente (no via constructor)
jest.mock("../../../../src/infrastructure/security/password_encrypter", () => ({
  compare: jest.fn(),
}));
jest.mock("../../../../src/infrastructure/security/token_generator", () => ({
  generate: jest.fn(),
}));
jest.mock("../../../../src/shared/utils/emailService", () => ({
  sendAccountLockedEmail: jest.fn().mockResolvedValue(true),
}));

const {
  compare,
} = require("../../../../src/infrastructure/security/password_encrypter");
const {
  generate,
} = require("../../../../src/infrastructure/security/token_generator");

// Helper para crear un usuario falso con toPublic()
function makeFakeUser(overrides = {}) {
  return {
    id: "user123",
    correo: "test@unistock.com",
    password: "hashed_pw",
    estado: true,
    rolId: "rol123",
    nombreCompleto: "Jose Tester",
    sedeId: "sede1",
    toPublic() {
      const { password, ...safe } = this;
      return safe;
    },
    ...overrides,
  };
}

describe("LoginUser", () => {
  let userRepository;
  let roleRepository;
  let siteRepository;
  let loginUser;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = {
      findByEmailWithPassword: jest.fn(),
      incrementFailedAttempts: jest.fn(),
      update: jest.fn(),
      resetFailedAttempts: jest.fn(),
      findActiveByRoleId: jest.fn().mockResolvedValue([]),
    };
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn().mockResolvedValue(null),
    };
    siteRepository = {
      findById: jest.fn(),
    };
    loginUser = new LoginUser(userRepository, roleRepository, siteRepository);
  });

  test("rama: usuario no existe -> 401 credenciales inválidas", async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(null);

    await expect(
      loginUser.execute({ correo: "noexiste@unistock.com", password: "x" }),
    ).rejects.toMatchObject({
      message: "Credenciales inválidas",
      statusCode: 401,
    });
  });

  test("rama: usuario existe pero está desactivado -> 403", async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(
      makeFakeUser({ estado: false }),
    );

    await expect(
      loginUser.execute({ correo: "test@unistock.com", password: "x" }),
    ).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.incrementFailedAttempts).not.toHaveBeenCalled();
  });

  test("rama: password incorrecta, aún no llega al máximo de intentos -> 401", async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(makeFakeUser());
    compare.mockResolvedValue(false);
    userRepository.incrementFailedAttempts.mockResolvedValue(2); // < 5

    await expect(
      loginUser.execute({ correo: "test@unistock.com", password: "malaPass" }),
    ).rejects.toMatchObject({
      message: "Credenciales inválidas",
      statusCode: 401,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  test("rama: password incorrecta y alcanza MAX_INTENTOS_FALLIDOS -> 403, bloquea cuenta y notifica gerentes", async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(makeFakeUser());
    compare.mockResolvedValue(false);
    userRepository.incrementFailedAttempts.mockResolvedValue(5); // == MAX
    roleRepository.findByName.mockResolvedValue({ id: "rolGerente" });
    userRepository.findActiveByRoleId.mockResolvedValue([
      { nombreCompleto: "Gerente Uno", correo: "gerente@unistock.com" },
    ]);

    await expect(
      loginUser.execute({ correo: "test@unistock.com", password: "malaPass" }),
    ).rejects.toMatchObject({ statusCode: 403 });

    expect(userRepository.update).toHaveBeenCalledWith("user123", {
      estado: false,
      intentosFallidos: 0,
    });
  });

  test("rama: password correcta pero rol no existe -> 403", async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(makeFakeUser());
    compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue(null);

    await expect(
      loginUser.execute({ correo: "test@unistock.com", password: "buenaPass" }),
    ).rejects.toMatchObject({
      message: "El rol del usuario no existe o está inactivo",
      statusCode: 403,
    });
  });

  test("rama: password correcta pero rol está inactivo -> 403", async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(makeFakeUser());
    compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue({
      nombre: "Empleado",
      estado: false,
    });

    await expect(
      loginUser.execute({ correo: "test@unistock.com", password: "buenaPass" }),
    ).rejects.toMatchObject({ statusCode: 403 });
  });

  test("camino feliz: login correcto devuelve token y usuario sin password", async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(makeFakeUser());
    compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue({
      nombre: "Empleado",
      estado: true,
    });
    siteRepository.findById.mockResolvedValue({ nombre: "Sede Central" });
    generate.mockReturnValue("fake.jwt.token");

    const result = await loginUser.execute({
      correo: "test@unistock.com",
      password: "buenaPass",
    });

    expect(result.token).toBe("fake.jwt.token");
    expect(result.user).not.toHaveProperty("password");
    expect(userRepository.resetFailedAttempts).toHaveBeenCalledWith("user123");
    expect(siteRepository.findById).toHaveBeenCalledWith("sede1");
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "user123",
        rolNombre: "Empleado",
        sedeNombre: "Sede Central",
      }),
    );
  });

  test("rama: password correcta y rol activo pero la sede no existe -> 403", async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(makeFakeUser());
    compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue({
      nombre: "Empleado",
      estado: true,
    });
    siteRepository.findById.mockResolvedValue(null);

    await expect(
      loginUser.execute({ correo: "test@unistock.com", password: "buenaPass" }),
    ).rejects.toMatchObject({
      message: "La sede del usuario no existe",
      statusCode: 403,
    });
    expect(generate).not.toHaveBeenCalled();
  });

  test("rama: la sede existe pero no tiene nombre -> 403", async () => {
    userRepository.findByEmailWithPassword.mockResolvedValue(makeFakeUser());
    compare.mockResolvedValue(true);
    roleRepository.findById.mockResolvedValue({
      nombre: "Empleado",
      estado: true,
    });
    siteRepository.findById.mockResolvedValue({ nombre: null });

    await expect(
      loginUser.execute({ correo: "test@unistock.com", password: "buenaPass" }),
    ).rejects.toMatchObject({
      message: "La sede del usuario no existe",
      statusCode: 403,
    });
  });
});
