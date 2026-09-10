const UpdateUser = require("../../../../src/application/use-cases/users/UpdateUser");

function makeExisting(overrides = {}) {
  return {
    id: "u1",
    correo: "actual@unistock.com",
    numeroDocumento: "111",
    toPublic() {
      const { password, ...safe } = this;
      return safe;
    },
    ...overrides,
  };
}

describe("UpdateUser", () => {
  let userRepository;
  let roleRepository;
  let siteRepository;
  let updateUser;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByDocument: jest.fn(),
      countActiveByRoleName: jest.fn().mockResolvedValue(0),
      update: jest.fn(),
    };
    roleRepository = { findById: jest.fn() };
    siteRepository = { findById: jest.fn() };
    updateUser = new UpdateUser(userRepository, roleRepository, siteRepository);
  });

  test("rama: usuario no encontrado -> 404", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(updateUser.execute("u1", {})).rejects.toMatchObject({
      message: "Usuario no encontrado",
      statusCode: 404,
    });
  });

  test("rama: nuevo correo ya usado por otro usuario -> 409", async () => {
    userRepository.findById.mockResolvedValue(makeExisting());
    userRepository.findByEmail.mockResolvedValue({ id: "otroUsuario" });

    await expect(
      updateUser.execute("u1", { correo: "otro@unistock.com" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test("rama: nuevo correo coincide con otro registro pero es el mismo usuario -> permite (no lanza)", async () => {
    userRepository.findById.mockResolvedValue(makeExisting());
    userRepository.findByEmail.mockResolvedValue({ id: "u1" }); // mismo id
    userRepository.update.mockResolvedValue({
      toObject: () => ({ id: "u1", correo: "otro@unistock.com" }),
    });

    await expect(
      updateUser.execute("u1", { correo: "otro@unistock.com" }),
    ).resolves.not.toHaveProperty("password");
  });

  test("rama: nuevo documento ya usado por otro usuario -> 409", async () => {
    userRepository.findById.mockResolvedValue(makeExisting());
    userRepository.findByDocument.mockResolvedValue({ id: "otroUsuario" });

    await expect(
      updateUser.execute("u1", { numeroDocumento: "999" }),
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  test("rama: rolId inválido o inactivo -> 422", async () => {
    userRepository.findById.mockResolvedValue(makeExisting());
    roleRepository.findById.mockResolvedValue({ nombre: "Empleado", estado: false });

    await expect(
      updateUser.execute("u1", { rolId: "rolX" }),
    ).rejects.toMatchObject({
      message: "Rol inválido o inactivo",
      statusCode: 422,
    });
  });

  test("rama: cambia a rol Gerente pero ya hay otro Gerente activo -> 409", async () => {
    userRepository.findById.mockResolvedValue(makeExisting());
    roleRepository.findById.mockResolvedValue({ nombre: "Gerente", estado: true });
    userRepository.countActiveByRoleName.mockResolvedValue(1);

    await expect(
      updateUser.execute("u1", { rolId: "rolGerente" }),
    ).rejects.toMatchObject({ statusCode: 409 });
    expect(userRepository.countActiveByRoleName).toHaveBeenCalledWith("Gerente", "u1");
  });

  test("rama: sedeId inválida o inactiva -> 422", async () => {
    userRepository.findById.mockResolvedValue(makeExisting());
    siteRepository.findById.mockResolvedValue({ estado: false });

    await expect(
      updateUser.execute("u1", { sedeId: "sedeX" }),
    ).rejects.toMatchObject({
      message: "Sede inválida o inactiva",
      statusCode: 422,
    });
  });

  test("rama: sin cambios en el payload -> devuelve el usuario existente sin tocar BD", async () => {
    userRepository.findById.mockResolvedValue(makeExisting());

    const result = await updateUser.execute("u1", {});
    expect(userRepository.update).not.toHaveBeenCalled();
    expect(result).not.toHaveProperty("password");
  });

  test("rama: update devuelve null (usuario borrado entre el find y el update) -> 404", async () => {
    userRepository.findById.mockResolvedValue(makeExisting());
    userRepository.update.mockResolvedValue(null);

    await expect(
      updateUser.execute("u1", { nombreCompleto: "Nuevo Nombre" }),
    ).rejects.toMatchObject({ statusCode: 404 });
  });

  test("camino feliz: aplica cambios simples y normaliza cargo", async () => {
    userRepository.findById.mockResolvedValue(makeExisting());
    userRepository.update.mockResolvedValue({
      toObject: () => ({
        id: "u1",
        nombreCompleto: "Nombre Actualizado",
        password: "no-debe-verse",
      }),
    });

    const result = await updateUser.execute("u1", {
      nombreCompleto: "  Nombre Actualizado  ",
      cargo: ["Corte", "Corte"],
    });

    expect(userRepository.update).toHaveBeenCalledWith(
      "u1",
      expect.objectContaining({
        nombreCompleto: "Nombre Actualizado",
        cargo: ["Corte"],
      }),
    );
    expect(result).not.toHaveProperty("password");
  });
});
