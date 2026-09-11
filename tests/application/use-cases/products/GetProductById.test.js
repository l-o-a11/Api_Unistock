const GetProductById = require("../../../../src/application/use-cases/products/GetProductById");

describe("GetProductById", () => {
  let productRepository;
  let getProductById;

  beforeEach(() => {
    jest.clearAllMocks();
    productRepository = { findById: jest.fn() };
    getProductById = new GetProductById(productRepository);
  });

  test("rama: producto no encontrado -> 404", async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(getProductById.execute("id-inexistente")).rejects.toMatchObject({
      message: "Producto no encontrado",
      statusCode: 404,
    });
  });

  test("camino feliz: devuelve el producto serializado con toJSON()", async () => {
    const product = { toJSON: jest.fn().mockReturnValue({ id: "p1", nombre: "Silla" }) };
    productRepository.findById.mockResolvedValue(product);

    const result = await getProductById.execute("p1");

    expect(productRepository.findById).toHaveBeenCalledWith("p1");
    expect(product.toJSON).toHaveBeenCalled();
    expect(result).toEqual({ id: "p1", nombre: "Silla" });
  });
});
