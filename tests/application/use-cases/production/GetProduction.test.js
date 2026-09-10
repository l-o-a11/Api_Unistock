const GetProduction = require("../../../../src/application/use-cases/production/GetProduction");

describe("GetProduction", () => {
  let productionRepository;
  let getProduction;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = { findAll: jest.fn() };
    getProduction = new GetProduction(productionRepository);
  });

  test("camino feliz: mapea cada orden con toJSON()", async () => {
    productionRepository.findAll.mockResolvedValue({
      data: [{ toJSON: () => ({ id: "p1" }) }, { toJSON: () => ({ id: "p2" }) }],
      total: 2,
    });

    const result = await getProduction.execute({ estado: "Diseño" });

    expect(productionRepository.findAll).toHaveBeenCalledWith({ estado: "Diseño" });
    expect(result).toEqual([{ id: "p1" }, { id: "p2" }]);
  });

  test("rama: sin filtros, usa un objeto vacío por defecto", async () => {
    productionRepository.findAll.mockResolvedValue({ data: [] });

    await getProduction.execute();

    expect(productionRepository.findAll).toHaveBeenCalledWith({});
  });

  test("rama: si result.data no es un arreglo, devuelve un arreglo vacío", async () => {
    productionRepository.findAll.mockResolvedValue({ data: null });

    const result = await getProduction.execute();

    expect(result).toEqual([]);
  });

  test("rama: si result no trae data, devuelve un arreglo vacío", async () => {
    productionRepository.findAll.mockResolvedValue({});

    const result = await getProduction.execute();

    expect(result).toEqual([]);
  });
});
