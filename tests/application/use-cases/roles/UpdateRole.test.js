const UpdateRole = require("../../../../src/application/use-cases/roles/UpdateRole");

jest.mock("../../../../src/shared/utils/rolePermissionValidator", () => ({
  validatePermissions: jest.fn(),
}));
const { validatePermissions } = require("../../../../src/shared/utils/rolePermissionValidator");

describe("UpdateRole", () => {
  let roleRepository;
  let moduleRepository;
  let privilegeRepository;
  let updateRole;

  beforeEach(() => {
    jest.clearAllMocks();
    roleRepository = {
      findById: jest.fn().mockResolvedValue({ id: "rol1", nombre: "Empleado", estado: true }),
      findByName: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue({ id: "rol1", nombre: "Empleado Senior" }),
    };
    moduleRepository = {};
    privilegeRepository = {};
    validatePermissions.mockResolvedValue([{ modulo: "usuarios", privilegios: ["ver"] }]);
    updateRole = new UpdateRole(roleRepository, moduleRepository, privilegeRepository);
  });

  test("rama: rol no encontrado -> 404", async () => {
    roleRepository.findById.mockResolvedValue(null);

    await expect(updateRole.execute("rolX", { nombre: "Nuevo" })).rejects.toMatchObject({
      message: "Rol no encontrado",
      statusCode: 404,
    });
  });

  test("rama: nombre vacío tras trim -> 422", async () => {
    await expect(updateRole.execute("rol1", { nombre: "   " })).rejects.toMatchObject({
      message: "Nombre es requerido",
      statusCode: 422,
    });
  });

  test("rama: nombre con formato inválido -> 422", async () => {
    await expect(updateRole.execute("rol1", { nombre: "Rol123" })).rejects.toMatchObject({
      message: "El nombre solo puede contener letras y espacios",
      statusCode: 422,
    });
  });

  test("rama: nuevo nombre ya usado por otro rol -> 409", async () => {
    roleRepository.findByName.mockResolvedValue({ id: "otroRol" });

    await expect(
      updateRole.execute("rol1", { nombre: "Empleado Senior" }),
    ).rejects.toMatchObject({
      message: "Ya existe un rol con ese nombre",
      statusCode: 409,
    });
  });

  test("rama: si el nombre no cambia (mismo valor), no valida unicidad", async () => {
    await updateRole.execute("rol1", { nombre: "Empleado" });

    expect(roleRepository.findByName).not.toHaveBeenCalled();
  });

  test("rama: sin nombre en el payload, no se modifica el nombre", async () => {
    await updateRole.execute("rol1", { estado: false });

    expect(roleRepository.update).toHaveBeenCalledWith(
      "rol1",
      expect.not.objectContaining({ nombre: expect.anything() }),
    );
  });

  test("rama: con permisos, se validan y se incluyen en los cambios", async () => {
    const permisos = [{ modulo: "usuarios", privilegios: ["ver"] }];
    await updateRole.execute("rol1", { permisos });

    expect(validatePermissions).toHaveBeenCalledWith(permisos, moduleRepository, privilegeRepository);
    expect(roleRepository.update).toHaveBeenCalledWith(
      "rol1",
      expect.objectContaining({ permisos: [{ modulo: "usuarios", privilegios: ["ver"] }] }),
    );
  });

  test("rama: sin permisos en el payload, no llama a validatePermissions", async () => {
    await updateRole.execute("rol1", { estado: false });

    expect(validatePermissions).not.toHaveBeenCalled();
  });

  test("camino feliz: actualiza nombre, descripción y estado", async () => {
    const result = await updateRole.execute("rol1", {
      nombre: "  Empleado Senior  ",
      descripcion: "Actualizado",
      estado: false,
    });

    expect(roleRepository.update).toHaveBeenCalledWith("rol1", {
      nombre: "Empleado Senior",
      descripcion: "Actualizado",
      estado: false,
    });
    expect(result).toEqual({ id: "rol1", nombre: "Empleado Senior" });
  });
});
