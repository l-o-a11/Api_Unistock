const UpdateProduct = require("../../../../src/application/use-cases/products/UpdateProduct");

function makeProduct(overrides = {}) {
  return {
    id: "p1",
    imagenes_Url: ["http://img/old.png"],
    referencia: "REF-OLD",
    nombre: "Nombre Viejo",
    precio: 1000,
    stock: 5,
    ...overrides,
  };
}

describe("UpdateProduct", () => {
  let productRepository;
  let updateProduct;

  beforeEach(() => {
    jest.clearAllMocks();
    productRepository = {
      findById: jest.fn(),
      findByReference: jest.fn(),
      update: jest.fn(),
    };
    updateProduct = new UpdateProduct(productRepository);
  });

  test("rama: producto no encontrado -> 404", async () => {
    productRepository.findById.mockResolvedValue(null);

    await expect(
      updateProduct.execute("id-inexistente", { nombre: "Nuevo" }),
    ).rejects.toMatchObject({ message: "Producto no encontrado", statusCode: 404 });
    expect(productRepository.update).not.toHaveBeenCalled();
  });

  test("rama: referencia cambia y ya existe en otro producto -> 409", async () => {
    productRepository.findById.mockResolvedValue(makeProduct());
    productRepository.findByReference.mockResolvedValue({ id: "otro-producto" });

    await expect(
      updateProduct.execute("p1", { referencia: "REF-NUEVA" }),
    ).rejects.toMatchObject({ message: "Producto ya existente", statusCode: 409 });
    expect(productRepository.update).not.toHaveBeenCalled();
  });

  test("rama: referencia cambia pero está libre -> continúa y actualiza", async () => {
    productRepository.findById.mockResolvedValue(makeProduct());
    productRepository.findByReference.mockResolvedValue(null);
    productRepository.update.mockResolvedValue({ id: "p1", referencia: "REF-NUEVA" });

    const result = await updateProduct.execute("p1", { referencia: "REF-NUEVA" });

    expect(productRepository.findByReference).toHaveBeenCalledWith("REF-NUEVA");
    expect(result).toEqual({ id: "p1", referencia: "REF-NUEVA" });
  });

  test("rama: referencia enviada pero igual a la actual, no valida unicidad", async () => {
    productRepository.findById.mockResolvedValue(makeProduct());
    productRepository.update.mockResolvedValue(makeProduct());

    await updateProduct.execute("p1", { referencia: "REF-OLD" });

    expect(productRepository.findByReference).not.toHaveBeenCalled();
  });

  test("rama: sin referencia en el payload, no valida unicidad", async () => {
    productRepository.findById.mockResolvedValue(makeProduct());
    productRepository.update.mockResolvedValue(makeProduct());

    await updateProduct.execute("p1", { precio: 2000 });

    expect(productRepository.findByReference).not.toHaveBeenCalled();
  });

  test("camino feliz: actualiza todos los campos y recorta el nombre", async () => {
    productRepository.findById.mockResolvedValue(makeProduct());
    productRepository.update.mockResolvedValue({ id: "p1" });

    await updateProduct.execute("p1", {
      imagenes_Url: ["http://img/new.png"],
      referencia: "REF-OLD",
      nombre: "  Nombre Nuevo  ",
      precio: 3000,
      stock: 20,
    });

    expect(productRepository.update).toHaveBeenCalledWith("p1", {
      imagenes_Url: ["http://img/new.png"],
      referencia: "REF-OLD",
      nombre: "Nombre Nuevo",
      precio: 3000,
      stock: 20,
    });
  });

  test("rama: payload vacío conserva todos los valores previos del producto", async () => {
    const existing = makeProduct();
    productRepository.findById.mockResolvedValue(existing);
    productRepository.update.mockResolvedValue(existing);

    await updateProduct.execute("p1", {});

    expect(productRepository.update).toHaveBeenCalledWith("p1", {
      imagenes_Url: existing.imagenes_Url,
      referencia: existing.referencia,
      nombre: existing.nombre,
      precio: existing.precio,
      stock: existing.stock,
    });
  });

  test("rama: stock en 0 se respeta (no cae al valor previo por ser falsy)", async () => {
    productRepository.findById.mockResolvedValue(makeProduct());
    productRepository.update.mockResolvedValue({ id: "p1", stock: 0 });

    await updateProduct.execute("p1", { stock: 0 });

    expect(productRepository.update).toHaveBeenCalledWith(
      "p1",
      expect.objectContaining({ stock: 0 }),
    );
  });
});
