const GetProduct = require("../../../../src/application/use-cases/products/GetProduct");

describe("GetProduct", () => {
  let productRepository;
  let getProduct;

  beforeEach(() => {
    jest.clearAllMocks();
    productRepository = { findAll: jest.fn() };
    getProduct = new GetProduct(productRepository);
  });

  test("camino feliz: mapea cada producto con toJSON()", async () => {
    productRepository.findAll.mockResolvedValue([
      { toJSON: () => ({ id: "p1" }) },
      { toJSON: () => ({ id: "p2" }) },
    ]);

    const result = await getProduct.execute({ search: "silla" });

    expect(productRepository.findAll).toHaveBeenCalledWith({ search: "silla" });
    expect(result).toEqual([{ id: "p1" }, { id: "p2" }]);
  });

  test("rama: sin filtros, usa un objeto vacío por defecto", async () => {
    productRepository.findAll.mockResolvedValue([]);

    await getProduct.execute();

    expect(productRepository.findAll).toHaveBeenCalledWith({});
  });

  test("rama: sin resultados, devuelve un arreglo vacío", async () => {
    productRepository.findAll.mockResolvedValue([]);

    const result = await getProduct.execute();

    expect(result).toEqual([]);
  });
});
