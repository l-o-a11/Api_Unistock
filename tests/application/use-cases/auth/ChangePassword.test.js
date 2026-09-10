const ChangePassword = require("../../../../src/application/use-cases/auth/ChangePassword");

jest.mock("../../../../src/infrastructure/security/password_encrypter", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

const { compare, hash } = require("../../../../src/infrastructure/security/password_encrypter");

describe("ChangePassword", () => {
  let userRepository;
  let changePassword;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = {
      findByIdWithPassword: jest.fn(),
      update: jest.fn(),
    };
    changePassword = new ChangePassword(userRepository);
  });

  test("rama: las contraseñas nuevas no coinciden -> 400", async () => {
    await expect(
      changePassword.execute({
        userId: "u1",
        passwordActual: "Vieja123*",
        passwordNueva: "Nueva123*",
        confirmarPassword: "Distinta123*",
      }),
    ).rejects.toMatchObject({
      message: "Las contraseñas no coinciden",
      statusCode: 400,
    });
    expect(userRepository.findByIdWithPassword).not.toHaveBeenCalled();
  });

  test("rama: contraseña nueva no cumple la política de seguridad -> 400", async () => {
    await expect(
      changePassword.execute({
        userId: "u1",
        passwordActual: "Vieja123*",
        passwordNueva: "simple", // sin mayúscula, número ni especial
        confirmarPassword: "simple",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("rama: usuario no encontrado -> 404", async () => {
    userRepository.findByIdWithPassword.mockResolvedValue(null);

    await expect(
      changePassword.execute({
        userId: "u1",
        passwordActual: "Vieja123*",
        passwordNueva: "Nueva123*",
        confirmarPassword: "Nueva123*",
      }),
    ).rejects.toMatchObject({
      message: "Usuario no encontrado",
      statusCode: 404,
    });
  });

  test("rama: contraseña actual incorrecta -> 400", async () => {
    userRepository.findByIdWithPassword.mockResolvedValue({ password: "hash_actual" });
    compare.mockResolvedValue(false);

    await expect(
      changePassword.execute({
        userId: "u1",
        passwordActual: "MalaActual1*",
        passwordNueva: "Nueva123*",
        confirmarPassword: "Nueva123*",
      }),
    ).rejects.toMatchObject({
      message: "La contraseña actual es incorrecta",
      statusCode: 400,
    });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  test("camino feliz: actualiza el hash y devuelve mensaje de éxito", async () => {
    userRepository.findByIdWithPassword.mockResolvedValue({ password: "hash_actual" });
    compare.mockResolvedValue(true);
    hash.mockResolvedValue("hash_nuevo");

    const result = await changePassword.execute({
      userId: "u1",
      passwordActual: "ActualBuena1*",
      passwordNueva: "Nueva123*",
      confirmarPassword: "Nueva123*",
    });

    expect(userRepository.update).toHaveBeenCalledWith("u1", { password: "hash_nuevo" });
    expect(result).toEqual({ message: "Contraseña actualizada correctamente" });
  });
});
