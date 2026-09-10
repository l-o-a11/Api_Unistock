const GetOrderDetails = require("../../../../src/application/use-cases/production/GetOrderDetails");

describe("GetOrderDetails", () => {
  let detailRepository;
  let getOrderDetails;

  beforeEach(() => {
    jest.clearAllMocks();
    detailRepository = { findAll: jest.fn() };
    getOrderDetails = new GetOrderDetails(detailRepository);
  });

  test("rama: sin filtros, usa un objeto vacío por defecto", async () => {
    detailRepository.findAll.mockResolvedValue([]);

    await getOrderDetails.execute();

    expect(detailRepository.findAll).toHaveBeenCalledWith({});
  });

  test("camino feliz: mapea cada detalle con toJSON()", async () => {
    detailRepository.findAll.mockResolvedValue([
      { toJSON: () => ({ id: "d1" }) },
      { toJSON: () => ({ id: "d2" }) },
    ]);

    const result = await getOrderDetails.execute({ id_orden: "orden1" });

    expect(detailRepository.findAll).toHaveBeenCalledWith({ id_orden: "orden1" });
    expect(result).toEqual([{ id: "d1" }, { id: "d2" }]);
  });
});
