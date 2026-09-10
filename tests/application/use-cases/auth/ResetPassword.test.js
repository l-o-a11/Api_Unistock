const ResetPassword = require("../../../../src/application/use-cases/auth/ResetPassword");

jest.mock("../../../../src/infrastructure/db/PasswordResetModel", () => ({
  findOne: jest.fn(),
  deleteOne: jest.fn(),
}));
jest.mock("../../../../src/infrastructure/security/password_encrypter", () => ({
  hash: jest.fn(),
}));
jest.mock("../../../../src/shared/utils/emailService", () => ({
  sendPasswordChangedEmail: jest.fn().mockResolvedValue(true),
}));

const PasswordResetModel = require("../../../../src/infrastructure/db/PasswordResetModel");
const { hash } = require("../../../../src/infrastructure/security/password_encrypter");
const { sendPasswordChangedEmail } = require("../../../../src/shared/utils/emailService");

describe("ResetPassword", () => {
  let userRepository;
  let resetPassword;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = { findByEmail: jest.fn(), update: jest.fn() };
    resetPassword = new ResetPassword(userRepository);
  });

  test("rama: las contraseñas no coinciden -> 400", async () => {
    await expect(
      resetPassword.execute({
        resetToken: "tok",
        password: "Nueva123*",
        confirmarPassword: "Distinta123*",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(PasswordResetModel.findOne).not.toHaveBeenCalled();
  });

  test("rama: la contraseña no cumple la política -> 400", async () => {
    await expect(
      resetPassword.execute({
        resetToken: "tok",
        password: "simple",
        confirmarPassword: "simple",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("rama: token inválido o ya utilizado -> 400", async () => {
    PasswordResetModel.findOne.mockResolvedValue(null);

    await expect(
      resetPassword.execute({
        resetToken: "tok-invalido",
        password: "Nueva123*",
        confirmarPassword: "Nueva123*",
      }),
    ).rejects.toMatchObject({
      message: "Token inválido o ya utilizado",
      statusCode: 400,
    });
  });

  test("rama: token expirado -> 400 y elimina el registro", async () => {
    PasswordResetModel.findOne.mockResolvedValue({
      _id: "reg1",
      expiraEn: new Date(Date.now() - 1000),
      correo: "x@unistock.com",
    });

    await expect(
      resetPassword.execute({
        resetToken: "tok",
        password: "Nueva123*",
        confirmarPassword: "Nueva123*",
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(PasswordResetModel.deleteOne).toHaveBeenCalledWith({ _id: "reg1" });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  test("camino feliz: actualiza password, invalida token y envía correo de confirmación", async () => {
    PasswordResetModel.findOne.mockResolvedValue({
      _id: "reg1",
      expiraEn: new Date(Date.now() + 60000),
      correo: "x@unistock.com",
    });
    userRepository.findByEmail.mockResolvedValue({
      id: "u1",
      nombreCompleto: "Jose Tester",
    });
    hash.mockResolvedValue("hash_nuevo");

    const result = await resetPassword.execute({
      resetToken: "tok-valido",
      password: "Nueva123*",
      confirmarPassword: "Nueva123*",
    });

    expect(userRepository.update).toHaveBeenCalledWith("u1", { password: "hash_nuevo" });
    expect(PasswordResetModel.deleteOne).toHaveBeenCalledWith({ _id: "reg1" });
    expect(sendPasswordChangedEmail).toHaveBeenCalled();
    expect(result).toEqual({ message: "Contraseña actualizada correctamente" });
  });
});
