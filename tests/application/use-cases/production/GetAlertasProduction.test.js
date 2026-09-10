const GetAlertasProduction = require("../../../../src/application/use-cases/production/GetAlertasProduction");

describe("GetAlertasProduction", () => {
  let productionRepository;
  let getAlertas;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {
      findAlertas: jest.fn(),
    };
    getAlertas = new GetAlertasProduction(productionRepository);
  });

  test("camino feliz: devuelve los tres grupos de alertas tal como los da el repositorio", async () => {
    const alertas = {
      vencidas: [{ id: "o1" }],
      proximas_vencer: [{ id: "o2" }],
      en_espera_larga: [{ id: "o3" }],
    };
    productionRepository.findAlertas.mockResolvedValue(alertas);

    const result = await getAlertas.execute();

    expect(productionRepository.findAlertas).toHaveBeenCalled();
    expect(result).toEqual(alertas);
  });
});
