const ForgotPassword = require("../../../../src/application/use-cases/auth/ForgotPassword");

jest.mock("../../../../src/infrastructure/db/PasswordResetModel", () => ({
  deleteMany: jest.fn(),
  create: jest.fn(),
}));
jest.mock("../../../../src/shared/utils/emailService", () => ({
  sendForgotPasswordEmail: jest.fn().mockResolvedValue(true),
  sendAlertEmail: jest.fn().mockResolvedValue(true),
}));

const PasswordResetModel = require("../../../../src/infrastructure/db/PasswordResetModel");
const {
  sendForgotPasswordEmail,
  sendAlertEmail,
} = require("../../../../src/shared/utils/emailService");

describe("ForgotPassword", () => {
  let userRepository;
  let forgotPassword;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = { findByEmail: jest.fn() };
    forgotPassword = new ForgotPassword(userRepository);
  });

  test("rama: correo no registrado -> 404", async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    await expect(
      forgotPassword.execute({ correo: "nadie@unistock.com" }),
    ).rejects.toMatchObject({ statusCode: 404 });
    expect(PasswordResetModel.create).not.toHaveBeenCalled();
  });

  test("rama: usuario existe pero está inactivo -> 403", async () => {
    userRepository.findByEmail.mockResolvedValue({
      estado: false,
      correo: "inactivo@unistock.com",
    });

    await expect(
      forgotPassword.execute({ correo: "inactivo@unistock.com" }),
    ).rejects.toMatchObject({
      message: "El usuario no está activo",
      statusCode: 403,
    });
  });

  test("camino feliz: invalida códigos previos, crea uno nuevo y envía ambos correos", async () => {
    userRepository.findByEmail.mockResolvedValue({
      estado: true,
      correo: "activo@unistock.com",
      nombreCompleto: "Jose Tester",
    });

    const result = await forgotPassword.execute({ correo: "activo@unistock.com" });

    expect(PasswordResetModel.deleteMany).toHaveBeenCalledWith({
      correo: "activo@unistock.com",
    });
    expect(PasswordResetModel.create).toHaveBeenCalledWith(
      expect.objectContaining({ correo: "activo@unistock.com" }),
    );
    // El código debe ser de 6 dígitos
    const createdArg = PasswordResetModel.create.mock.calls[0][0];
    expect(createdArg.codigo).toMatch(/^\d{6}$/);

    expect(sendForgotPasswordEmail).toHaveBeenCalled();
    expect(sendAlertEmail).toHaveBeenCalled();
    expect(result.message).toMatch(/código de recuperación/);
  });
});
