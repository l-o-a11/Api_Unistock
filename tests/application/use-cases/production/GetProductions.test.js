const GetProductions = require("../../../../src/application/use-cases/production/GetProductions");

describe("GetProductions", () => {
  let productionRepository;
  let getProductions;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = { findAll: jest.fn() };
    getProductions = new GetProductions(productionRepository);
  });

  test("camino feliz: mapea la data y conserva la paginación del repositorio", async () => {
    productionRepository.findAll.mockResolvedValue({
      data: [{ toJSON: () => ({ id: "p1" }) }, { toJSON: () => ({ id: "p2" }) }],
      total: 20,
      page: 2,
      limit: 10,
      totalPages: 2,
    });

    const result = await getProductions.execute({ page: 2, limit: 10 });

    expect(result).toEqual({
      data: [{ id: "p1" }, { id: "p2" }],
      total: 20,
      page: 2,
      limit: 10,
      totalPages: 2,
    });
  });

  test("rama: si result.data no es un arreglo, usa un arreglo vacío", async () => {
    productionRepository.findAll.mockResolvedValue({ data: null });

    const result = await getProductions.execute();

    expect(result.data).toEqual([]);
  });

  test("rama: valores de paginación ausentes usan los valores por defecto", async () => {
    productionRepository.findAll.mockResolvedValue({
      data: [{ toJSON: () => ({ id: "p1" }) }],
    });

    const result = await getProductions.execute();

    expect(result).toEqual({
      data: [{ id: "p1" }],
      total: 0,
      page: 1,
      limit: 1,
      totalPages: 0,
    });
  });

  test("rama: result sin data ni orders, limit por defecto usa el largo del arreglo vacío", async () => {
    productionRepository.findAll.mockResolvedValue({});

    const result = await getProductions.execute();

    expect(result).toEqual({ data: [], total: 0, page: 1, limit: 0, totalPages: 0 });
  });
});
