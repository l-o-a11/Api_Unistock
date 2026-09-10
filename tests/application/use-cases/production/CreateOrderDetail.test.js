const CreateOrderDetail = require("../../../../src/application/use-cases/production/CreateOrderDetail");

function baseData(overrides = {}) {
  return {
    id_orden: "orden1",
    id_producto: "prod1",
    cantidad: 3,
    color: "  Rojo  ",
    ...overrides,
  };
}

describe("CreateOrderDetail", () => {
  let detailRepository;
  let productionRepository;
  let createOrderDetail;

  beforeEach(() => {
    jest.clearAllMocks();
    detailRepository = {
      create: jest.fn().mockResolvedValue({
        toJSON: () => ({ id: "detail1", id_orden: "orden1" }),
      }),
    };
    productionRepository = {
      findById: jest.fn().mockResolvedValue({ estaAnulada: jest.fn().mockReturnValue(false) }),
    };
    createOrderDetail = new CreateOrderDetail(detailRepository, productionRepository);
  });

  test("rama: falta id_orden -> 400", async () => {
    await expect(
      createOrderDetail.execute(baseData({ id_orden: undefined })),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("rama: falta id_producto -> 400", async () => {
    await expect(
      createOrderDetail.execute(baseData({ id_producto: undefined })),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("rama: falta cantidad (undefined) -> 400", async () => {
    await expect(
      createOrderDetail.execute(baseData({ cantidad: undefined })),
    ).rejects.toMatchObject({
      message: "Los campos id_orden, id_producto y cantidad son obligatorios",
      statusCode: 400,
    });
  });

  test("rama: cantidad no numérica -> 400", async () => {
    await expect(
      createOrderDetail.execute(baseData({ cantidad: "abc" })),
    ).rejects.toMatchObject({
      message: "cantidad debe ser un número mayor a 0",
      statusCode: 400,
    });
  });

  test("rama: cantidad menor o igual a 0 -> 400", async () => {
    await expect(
      createOrderDetail.execute(baseData({ cantidad: 0 })),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("rama: la orden no existe -> 404", async () => {
    productionRepository.findById.mockResolvedValue(null);

    await expect(createOrderDetail.execute(baseData())).rejects.toMatchObject({
      message: "La orden de producción no existe",
      statusCode: 404,
    });
  });

  test("rama: la orden está anulada -> 422", async () => {
    productionRepository.findById.mockResolvedValue({
      estaAnulada: jest.fn().mockReturnValue(true),
    });

    await expect(createOrderDetail.execute(baseData())).rejects.toMatchObject({
      message: "No se pueden agregar detalles a una orden anulada",
      statusCode: 422,
    });
  });

  test("camino feliz: crea el detalle trimeando el color", async () => {
    const result = await createOrderDetail.execute(baseData());

    expect(detailRepository.create).toHaveBeenCalledWith({
      id_orden: "orden1",
      id_producto: "prod1",
      cantidad: 3,
      color: "Rojo",
      estado: true,
    });
    expect(result).toEqual({ id: "detail1", id_orden: "orden1" });
  });

  test("rama: sin color, se guarda como null", async () => {
    await createOrderDetail.execute(baseData({ color: undefined }));

    expect(detailRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ color: null }),
    );
  });
});
