const GetProductionById = require("../../../../src/application/use-cases/production/GetProductionById");

describe("GetProductionById", () => {
  let productionRepository;
  let getProductionById;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = { findById: jest.fn() };
    getProductionById = new GetProductionById(productionRepository);
  });

  test("rama: orden no encontrada -> 404", async () => {
    productionRepository.findById.mockResolvedValue(null);

    await expect(getProductionById.execute("id-inexistente")).rejects.toMatchObject({
      message: "Orden de producción no encontrada",
      statusCode: 404,
    });
  });

  test("camino feliz: devuelve la orden serializada con toJSON()", async () => {
    const production = { toJSON: jest.fn().mockReturnValue({ id: "p1", cliente: "Acme" }) };
    productionRepository.findById.mockResolvedValue(production);

    const result = await getProductionById.execute("p1");

    expect(productionRepository.findById).toHaveBeenCalledWith("p1");
    expect(production.toJSON).toHaveBeenCalled();
    expect(result).toEqual({ id: "p1", cliente: "Acme" });
  });
});
