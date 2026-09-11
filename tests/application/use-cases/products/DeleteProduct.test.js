const DeleteProduct = require("../../../../src/application/use-cases/products/DeleteProduct");

describe("DeleteProduct", () => {
  let productRepository;
  let deleteProduct;

  beforeEach(() => {
    jest.clearAllMocks();
    productRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    deleteProduct = new DeleteProduct(productRepository);
  });

  test("rama: producto no encontrado -> 404", async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(deleteProduct.execute("id-inexistente")).rejects.toMatchObject({
      message: "Producto no encontrado",
      statusCode: 404,
    });
    expect(productRepository.delete).not.toHaveBeenCalled();
  });

  test("camino feliz: elimina el producto y confirma el mensaje", async () => {
    productRepository.findById.mockResolvedValue({ id: "p1", nombre: "Silla" });
    productRepository.delete.mockResolvedValue(true);

    const result = await deleteProduct.execute("p1");

    expect(productRepository.delete).toHaveBeenCalledWith("p1");
    expect(result).toEqual({ message: "Producto eliminado correctamente" });
  });
});
