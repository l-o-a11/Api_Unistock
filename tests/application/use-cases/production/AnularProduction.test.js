const AnularProduction = require("../../../../src/application/use-cases/production/AnularProduction");

function makeProduction(overrides = {}) {
  return {
    estaAnulada: jest.fn().mockReturnValue(false),
    ...overrides,
  };
}

describe("AnularProduction", () => {
  let productionRepository;
  let anularProduction;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {
      findById: jest.fn(),
      anular: jest.fn(),
    };
    anularProduction = new AnularProduction(productionRepository);
  });

  test("rama: orden no encontrada -> 404", async () => {
    productionRepository.findById.mockResolvedValue(null);

    await expect(
      anularProduction.execute("id1", "motivo válido", "user1", {}),
    ).rejects.toMatchObject({
      message: "Orden de producción no encontrada",
      statusCode: 404,
    });
  });

  test("rama: la orden ya está anulada -> 422", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction({ estaAnulada: jest.fn().mockReturnValue(true) }));

    await expect(
      anularProduction.execute("id1", "motivo válido", "user1", {}),
    ).rejects.toMatchObject({
      message: "La orden ya se encuentra anulada",
      statusCode: 422,
    });
  });

  test("rama: motivo ausente -> 400", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction());

    await expect(
      anularProduction.execute("id1", undefined, "user1", {}),
    ).rejects.toMatchObject({
      message: "El motivo de anulación es requerido",
      statusCode: 400,
    });
  });

  test("rama: motivo solo con espacios -> 400", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction());

    await expect(
      anularProduction.execute("id1", "     ", "user1", {}),
    ).rejects.toMatchObject({
      message: "El motivo de anulación es requerido",
      statusCode: 400,
    });
  });

  test("camino feliz: anula la orden con el motivo trimeado y devuelve toJSON()", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction());
    productionRepository.anular.mockResolvedValue({
      toJSON: () => ({ id: "id1", estado: "Anulada" }),
    });
    const user = { id: "u1", rolNombre: "Gerente" };

    const result = await anularProduction.execute("id1", "  Cliente canceló  ", "u1", user);

    expect(productionRepository.anular).toHaveBeenCalledWith(
      "id1",
      "Cliente canceló",
      "u1",
      user,
    );
    expect(result).toEqual({ id: "id1", estado: "Anulada" });
  });
});
