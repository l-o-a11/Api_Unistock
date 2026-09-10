const DeleteRole = require("../../../../src/application/use-cases/roles/DeleteRole");

describe("DeleteRole", () => {
  let roleRepository;
  let userRepository;
  let deleteRole;

  beforeEach(() => {
    jest.clearAllMocks();
    roleRepository = {
      findById: jest.fn().mockResolvedValue({ id: "rol1", nombre: "Empleado" }),
      delete: jest.fn().mockResolvedValue(true),
    };
    userRepository = {
      findAll: jest.fn().mockResolvedValue([]),
    };
    deleteRole = new DeleteRole(roleRepository, userRepository);
  });

  test("rama: rol no encontrado -> 404", async () => {
    roleRepository.findById.mockResolvedValue(null);

    await expect(deleteRole.execute("rolX")).rejects.toMatchObject({
      message: "Rol no encontrado",
      statusCode: 404,
    });
  });

  test("rama: hay usuarios activos con ese rol -> 422", async () => {
    userRepository.findAll.mockResolvedValue([{ id: "u1" }]);

    await expect(deleteRole.execute("rol1")).rejects.toMatchObject({
      message: "No se puede eliminar el rol porque hay usuarios activos asignados",
      statusCode: 422,
    });
    expect(roleRepository.delete).not.toHaveBeenCalled();
  });

  test("camino feliz: elimina el rol cuando no tiene usuarios activos", async () => {
    const result = await deleteRole.execute("rol1");

    expect(userRepository.findAll).toHaveBeenCalledWith({ rolId: "rol1", estado: true });
    expect(roleRepository.delete).toHaveBeenCalledWith("rol1");
    expect(result).toEqual({ deleted: true, id: "rol1" });
  });
});
