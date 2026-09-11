const CreateProduct = require("../../../../src/application/use-cases/products/CreateProduct");

function baseData(overrides = {}) {
  return {
    id_categorias: "cat1",
    imagenes_Url: ["http://img/1.png"],
    referencia: "REF-001",
    nombre: "Silla Nórdica",
    precio: 150000,
    stock: 10,
    ...overrides,
  };
}

describe("CreateProduct", () => {
  let productRepository;
  let createProduct;

  beforeEach(() => {
    jest.clearAllMocks();
    productRepository = {
      findByReference: jest.fn().mockResolvedValue(null),
      save: jest.fn(),
    };
    createProduct = new CreateProduct(productRepository);
  });

  test("rama: sin id_categorias -> 400", async () => {
    await expect(
      createProduct.execute(baseData({ id_categorias: undefined })),
    ).rejects.toMatchObject({ message: "id_categorias es obligatorio", statusCode: 400 });
  });

  test("rama: sin imagenes_Url -> 400", async () => {
    await expect(
      createProduct.execute(baseData({ imagenes_Url: undefined })),
    ).rejects.toMatchObject({ message: "Se requiere al menos una imagen", statusCode: 400 });
  });

  test("rama: imagenes_Url no es un arreglo -> 400", async () => {
    await expect(
      createProduct.execute(baseData({ imagenes_Url: "no-es-arreglo" })),
    ).rejects.toMatchObject({ message: "Se requiere al menos una imagen", statusCode: 400 });
  });

  test("rama: imagenes_Url es un arreglo vacío -> 400", async () => {
    await expect(
      createProduct.execute(baseData({ imagenes_Url: [] })),
    ).rejects.toMatchObject({ message: "Se requiere al menos una imagen", statusCode: 400 });
  });

  test("rama: sin nombre -> 400", async () => {
    await expect(
      createProduct.execute(baseData({ nombre: "" })),
    ).rejects.toMatchObject({ message: "El nombre es obligatorio", statusCode: 400 });
  });

  test("rama: sin referencia -> 400", async () => {
    await expect(
      createProduct.execute(baseData({ referencia: "" })),
    ).rejects.toMatchObject({ message: "La referencia es obligatoria", statusCode: 400 });
  });

  test("rama: sin precio -> 400", async () => {
    await expect(
      createProduct.execute(baseData({ precio: 0 })),
    ).rejects.toMatchObject({ message: "El precio es obligatorio", statusCode: 400 });
  });

  test("rama: sin stock (undefined) -> 400", async () => {
    await expect(
      createProduct.execute(baseData({ stock: undefined })),
    ).rejects.toMatchObject({ message: "El stock es obligatorio", statusCode: 400 });
  });

  test("rama: stock null -> 400", async () => {
    await expect(
      createProduct.execute(baseData({ stock: null })),
    ).rejects.toMatchObject({ message: "El stock es obligatorio", statusCode: 400 });
  });

  test("rama: stock en 0 es válido (no dispara la validación de obligatorio)", async () => {
    productRepository.save.mockResolvedValue({ id: "p1", stock: 0 });

    await createProduct.execute(baseData({ stock: 0 }));

    expect(productRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({ stock: 0 }),
    );
  });

  test("rama: referencia ya existe -> 409", async () => {
    productRepository.findByReference.mockResolvedValue({ id: "p-existente" });

    await expect(createProduct.execute(baseData())).rejects.toMatchObject({
      message: "Producto ya existente",
      statusCode: 409,
    });
    expect(productRepository.save).not.toHaveBeenCalled();
  });

  test("camino feliz: crea el producto, recorta espacios de nombre y referencia y fuerza estado=true", async () => {
    productRepository.save.mockResolvedValue({ id: "p1", nombre: "Silla Nórdica" });

    const result = await createProduct.execute(
      baseData({ nombre: "  Silla Nórdica  ", referencia: "  REF-001  " }),
    );

    expect(productRepository.findByReference).toHaveBeenCalledWith("  REF-001  ");
    expect(productRepository.save).toHaveBeenCalledWith({
      id_categorias: "cat1",
      imagenes_Url: ["http://img/1.png"],
      referencia: "REF-001",
      nombre: "Silla Nórdica",
      precio: 150000,
      stock: 10,
      estado: true,
    });
    expect(result).toEqual({ id: "p1", nombre: "Silla Nórdica" });
  });
});
