const UpdateProduction = require("../../../../src/application/use-cases/production/UpdateProduction");

function makeExisting(overrides = {}) {
  return {
    estaAnulada: jest.fn().mockReturnValue(false),
    toJSON: jest.fn().mockReturnValue({ id: "p1", cliente: "Cliente viejo" }),
    ...overrides,
  };
}

describe("UpdateProduction", () => {
  let productionRepository;
  let updateProduction;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };
    updateProduction = new UpdateProduction(productionRepository);
  });

  test("rama: orden no encontrada -> 404", async () => {
    productionRepository.findById.mockResolvedValue(null);

    await expect(
      updateProduction.execute("id-inexistente", { cliente: "Acme" }),
    ).rejects.toMatchObject({
      message: "Orden de producción no encontrada",
      statusCode: 404,
    });
    expect(productionRepository.update).not.toHaveBeenCalled();
  });

  test("rama: orden anulada -> 422", async () => {
    productionRepository.findById.mockResolvedValue(
      makeExisting({ estaAnulada: jest.fn().mockReturnValue(true) }),
    );

    await expect(
      updateProduction.execute("p1", { cliente: "Acme" }),
    ).rejects.toMatchObject({
      message: "No se puede editar una orden anulada",
      statusCode: 422,
    });
    expect(productionRepository.update).not.toHaveBeenCalled();
  });

  test("rama: existing sin método estaAnulada, no rompe la validación", async () => {
    const existing = makeExisting();
    delete existing.estaAnulada;
    productionRepository.findById.mockResolvedValue(existing);
    productionRepository.update.mockResolvedValue({
      toJSON: () => ({ id: "p1", cliente: "Acme" }),
    });

    const result = await updateProduction.execute("p1", { cliente: "Acme" });

    expect(result).toEqual({ id: "p1", cliente: "Acme" });
  });

  test("rama: sin campos para cambiar, devuelve la orden actual sin tocar el repositorio", async () => {
    const existing = makeExisting();
    productionRepository.findById.mockResolvedValue(existing);

    const result = await updateProduction.execute("p1", {});

    expect(productionRepository.update).not.toHaveBeenCalled();
    expect(existing.toJSON).toHaveBeenCalled();
    expect(result).toEqual({ id: "p1", cliente: "Cliente viejo" });
  });

  test("rama: sin campos para cambiar y existing sin toJSON, devuelve el objeto tal cual", async () => {
    const existing = { estaAnulada: jest.fn().mockReturnValue(false) };
    productionRepository.findById.mockResolvedValue(existing);

    const result = await updateProduction.execute("p1", {});

    expect(productionRepository.update).not.toHaveBeenCalled();
    expect(result).toBe(existing);
  });

  test("camino feliz: actualiza fecha_entrega, cliente (trimeado), producto y referencia", async () => {
    productionRepository.findById.mockResolvedValue(makeExisting());
    productionRepository.update.mockResolvedValue({
      toJSON: () => ({ id: "p1", cliente: "Acme" }),
    });

    const result = await updateProduction.execute("p1", {
      fecha_entrega: "2026-12-01",
      cliente: "  Acme  ",
      producto: "Silla",
      referencia: "REF-1",
    });

    expect(productionRepository.update).toHaveBeenCalledWith("p1", {
      fecha_entrega: "2026-12-01",
      cliente: "Acme",
      producto: "Silla",
      referencia: "REF-1",
    });
    expect(result).toEqual({ id: "p1", cliente: "Acme" });
  });

  test("rama: solo se envían los campos presentes en el payload", async () => {
    productionRepository.findById.mockResolvedValue(makeExisting());
    productionRepository.update.mockResolvedValue({
      toJSON: () => ({ id: "p1", producto: "Silla" }),
    });

    await updateProduction.execute("p1", { producto: "Silla" });

    expect(productionRepository.update).toHaveBeenCalledWith("p1", { producto: "Silla" });
  });

  test("rama: el repositorio no encuentra la orden al actualizar -> 404", async () => {
    productionRepository.findById.mockResolvedValue(makeExisting());
    productionRepository.update.mockResolvedValue(null);

    await expect(
      updateProduction.execute("p1", { cliente: "Acme" }),
    ).rejects.toMatchObject({
      message: "Orden de producción no encontrada",
      statusCode: 404,
    });
  });
});
