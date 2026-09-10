const GetCalendarioProduction = require("../../../../src/application/use-cases/production/GetCalendarioProduction");

describe("GetCalendarioProduction", () => {
  let productionRepository;
  let getCalendario;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {
      findParaCalendario: jest.fn(),
    };
    getCalendario = new GetCalendarioProduction(productionRepository);
  });

  test("rama: sin órdenes, devuelve un arreglo vacío", async () => {
    productionRepository.findParaCalendario.mockResolvedValue([]);

    const result = await getCalendario.execute("2026-01-01", "2026-01-31");

    expect(productionRepository.findParaCalendario).toHaveBeenCalledWith(
      "2026-01-01",
      "2026-01-31",
    );
    expect(result).toEqual([]);
  });

  test("rama: estado mapeado usa su color/tipo y la fecha de ultimo_cambio", async () => {
    productionRepository.findParaCalendario.mockResolvedValue([
      {
        id: "o1",
        numero_orden: 1,
        cliente: "Cliente A",
        estado: "Corte",
        fecha_entrega: "2026-02-10",
        ultimo_cambio: { fecha: "2026-02-01" },
      },
    ]);

    const result = await getCalendario.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      id: "estado-o1",
      tipo: "corte",
      color: "#0891b2",
      date: "2026-02-01",
    });
    expect(result[1]).toMatchObject({
      id: "entrega-o1",
      tipo: "entrega",
      color: "#16a34a",
      date: "2026-02-10",
    });
  });

  test("rama: estado no mapeado usa el color/tipo por defecto", async () => {
    productionRepository.findParaCalendario.mockResolvedValue([
      {
        id: "o2",
        numero_orden: 2,
        cliente: "Cliente B",
        estado: "Enviado",
        fecha_entrega: "2026-03-05",
        ultimo_cambio: null,
      },
    ]);

    const result = await getCalendario.execute();

    expect(result[0]).toMatchObject({ tipo: "creacion", color: "#6366f1" });
  });

  test("rama: sin ultimo_cambio.fecha, usa fecha_entrega para el evento de estado", async () => {
    productionRepository.findParaCalendario.mockResolvedValue([
      {
        id: "o3",
        numero_orden: 3,
        cliente: "Cliente C",
        estado: "Diseño",
        fecha_entrega: "2026-04-20",
        ultimo_cambio: undefined,
      },
    ]);

    const result = await getCalendario.execute();

    expect(result[0]).toMatchObject({ date: "2026-04-20", tipo: "diseno" });
  });
});
