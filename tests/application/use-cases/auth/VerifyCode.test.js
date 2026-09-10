const VerifyCode = require("../../../../src/application/use-cases/auth/VerifyCode");

jest.mock("../../../../src/infrastructure/db/PasswordResetModel", () => ({
  findOne: jest.fn(),
  deleteOne: jest.fn(),
  updateOne: jest.fn(),
}));

const PasswordResetModel = require("../../../../src/infrastructure/db/PasswordResetModel");

describe("VerifyCode", () => {
  let verifyCode;

  beforeEach(() => {
    jest.clearAllMocks();
    verifyCode = new VerifyCode();
  });

  test("rama: no hay solicitud activa para el correo -> 400", async () => {
    PasswordResetModel.findOne.mockResolvedValue(null);

    await expect(
      verifyCode.execute({ correo: "x@unistock.com", codigo: "123456" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("rama: código expirado -> 400 y elimina el registro", async () => {
    PasswordResetModel.findOne.mockResolvedValue({
      _id: "reg1",
      expiraEn: new Date(Date.now() - 1000), // ya pasó
      intentos: 0,
      codigo: "111111",
    });

    await expect(
      verifyCode.execute({ correo: "x@unistock.com", codigo: "123456" }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(PasswordResetModel.deleteOne).toHaveBeenCalledWith({ _id: "reg1" });
  });

  test("rama: máximo de intentos alcanzado -> 400 y elimina el registro", async () => {
    PasswordResetModel.findOne.mockResolvedValue({
      _id: "reg1",
      expiraEn: new Date(Date.now() + 60000),
      intentos: 3, // == MAX_INTENTOS
      codigo: "111111",
    });

    await expect(
      verifyCode.execute({ correo: "x@unistock.com", codigo: "123456" }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(PasswordResetModel.deleteOne).toHaveBeenCalledWith({ _id: "reg1" });
  });

  test("rama: código incorrecto -> 400, incrementa intentos y avisa cuántos quedan", async () => {
    PasswordResetModel.findOne.mockResolvedValue({
      _id: "reg1",
      expiraEn: new Date(Date.now() + 60000),
      intentos: 1,
      codigo: "999999",
    });

    await expect(
      verifyCode.execute({ correo: "x@unistock.com", codigo: "000000" }),
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("intentos"),
    });
    expect(PasswordResetModel.updateOne).toHaveBeenCalledWith(
      { _id: "reg1" },
      { $inc: { intentos: 1 } },
    );
  });

  test("camino feliz: código correcto genera y guarda resetToken", async () => {
    PasswordResetModel.findOne.mockResolvedValue({
      _id: "reg1",
      expiraEn: new Date(Date.now() + 60000),
      intentos: 0,
      codigo: "654321",
    });

    const result = await verifyCode.execute({
      correo: "x@unistock.com",
      codigo: "654321",
    });

    expect(result.resetToken).toMatch(/^[a-f0-9]{64}$/); // 32 bytes hex
    expect(PasswordResetModel.updateOne).toHaveBeenCalledWith(
      { _id: "reg1" },
      { resetToken: result.resetToken, usado: false },
    );
  });
});
