const CreateProduction = require("../../../../src/application/use-cases/production/CreateProduction");

function baseData(overrides = {}) {
  return {
    fecha_entrega: "2026-12-01",
    cliente: "Cliente X",
    id_produccion: "prod1",
    ...overrides,
  };
}

describe("CreateProduction", () => {
  let productionRepository;
  let createProduction;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {
      create: jest.fn().mockResolvedValue({ id: "orden1" }),
    };
    createProduction = new CreateProduction(productionRepository);
  });

  test("rama: falta fecha_entrega -> 400", async () => {
    await expect(
      createProduction.execute(baseData({ fecha_entrega: undefined })),
    ).rejects.toMatchObject({ message: "Faltan campos requeridos", statusCode: 400 });
  });

  test("rama: falta cliente -> 400", async () => {
    await expect(
      createProduction.execute(baseData({ cliente: undefined })),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("rama: falta id_produccion -> 400", async () => {
    await expect(
      createProduction.execute(baseData({ id_produccion: undefined })),
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  test("camino feliz: crea la orden con los campos dados", async () => {
    const result = await createProduction.execute(baseData());

    expect(productionRepository.create).toHaveBeenCalledWith({
      fecha_entrega: "2026-12-01",
      cliente: "Cliente X",
      id_produccion: "prod1",
    });
    expect(result).toEqual({ id: "orden1" });
  });
});
