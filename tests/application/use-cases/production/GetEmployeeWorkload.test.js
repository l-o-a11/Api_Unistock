const GetEmployeeWorkload = require("../../../../src/application/use-cases/production/GetEmployeeWorkload");

describe("GetEmployeeWorkload", () => {
  let userRepository;
  let productionRepository;
  let getWorkload;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = { findAll: jest.fn() };
    productionRepository = { findAll: jest.fn() };
    getWorkload = new GetEmployeeWorkload(userRepository, productionRepository);
  });

  test("rama: excluye empleados inactivos", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: false, rolNombre: "Empleado", cargos: ["Corte"] },
    ]);
    productionRepository.findAll.mockResolvedValue([]);

    const result = await getWorkload.execute("Corte");

    expect(result).toEqual([]);
  });

  test("rama: excluye usuarios cuyo rol no es Empleado", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Administrador", cargos: ["Corte"] },
    ]);
    productionRepository.findAll.mockResolvedValue([]);

    const result = await getWorkload.execute("Corte");

    expect(result).toEqual([]);
  });

  test("rama: sin cargo solicitado, incluye a todos los empleados activos", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargos: ["Corte"] },
      { id: "e2", estado: true, rolNombre: "  EMPLEADO  ", nombreCompleto: "Emp Dos", cargos: [] },
    ]);
    productionRepository.findAll.mockResolvedValue([]);

    const result = await getWorkload.execute();

    expect(result.map((e) => e.id)).toEqual(["e1", "e2"]);
  });

  test("rama: con cargo solicitado, filtra por cargos que coincidan (ignorando tildes/mayúsculas)", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargos: ["Ficha Técnica"] },
      { id: "e2", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Dos", cargos: ["Corte"] },
    ]);
    productionRepository.findAll.mockResolvedValue([]);

    const result = await getWorkload.execute("ficha tecnica");

    expect(result.map((e) => e.id)).toEqual(["e1"]);
  });

  test("rama: cuenta órdenes activas asignadas, ignorando Anulada y Enviado, y las sin empleado asignado", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargos: [] },
    ]);
    productionRepository.findAll.mockResolvedValue([
      { empleadoAsignadoId: "e1", estado: "Corte" },
      { empleadoAsignadoId: "e1", estado: "Compras" },
      { empleadoAsignadoId: "e1", estado: "Anulada" },
      { empleadoAsignadoId: "e1", estado: "Enviado" },
      { empleadoAsignadoId: null, estado: "Corte" },
    ]);

    const result = await getWorkload.execute();

    expect(result).toEqual([
      { id: "e1", nombreCompleto: "Emp Uno", produccionesAsignadas: 2 },
    ]);
  });

  test("rama: empleado sin órdenes asignadas queda en 0", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargos: [] },
    ]);
    productionRepository.findAll.mockResolvedValue([]);

    const result = await getWorkload.execute();

    expect(result).toEqual([
      { id: "e1", nombreCompleto: "Emp Uno", produccionesAsignadas: 0 },
    ]);
  });

  test("rama: filtra por 'cargo' (singular, string) cuando el usuario no tiene 'cargos'", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargo: "Corte" },
    ]);
    productionRepository.findAll.mockResolvedValue([]);

    const result = await getWorkload.execute("corte");

    expect(result.map((e) => e.id)).toEqual(["e1"]);
  });

  test("rama: filtra por 'cargo' cuando viene como arreglo", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargo: ["Compras", "Corte"] },
    ]);
    productionRepository.findAll.mockResolvedValue([]);

    const result = await getWorkload.execute("Compras");

    expect(result.map((e) => e.id)).toEqual(["e1"]);
  });

  test("rama: usuario sin 'cargo' ni 'cargos' no coincide con un cargo solicitado", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno" },
    ]);
    productionRepository.findAll.mockResolvedValue([]);

    const result = await getWorkload.execute("Corte");

    expect(result).toEqual([]);
  });

  test("rama: cuenta asignación legado (empleadoAsignaciones[estado] como string)", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargos: [] },
    ]);
    productionRepository.findAll.mockResolvedValue([
      { estado: "Corte", empleadoAsignaciones: { Corte: "e1" } },
    ]);

    const result = await getWorkload.execute();

    expect(result).toEqual([
      { id: "e1", nombreCompleto: "Emp Uno", produccionesAsignadas: 1 },
    ]);
  });

  test("rama: cuenta asignación legado (empleadoAsignaciones[estado] como objeto con id_empleado)", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargos: [] },
    ]);
    productionRepository.findAll.mockResolvedValue([
      { estado: "Corte", empleadoAsignaciones: { Corte: { id_empleado: "e1" } } },
    ]);

    const result = await getWorkload.execute();

    expect(result).toEqual([
      { id: "e1", nombreCompleto: "Emp Uno", produccionesAsignadas: 1 },
    ]);
  });

  test("rama: cuenta asignación legado (objeto con empleadoId como respaldo de id_empleado)", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargos: [] },
    ]);
    productionRepository.findAll.mockResolvedValue([
      { estado: "Corte", empleadoAsignaciones: { Corte: { empleadoId: "e1" } } },
    ]);

    const result = await getWorkload.execute();

    expect(result).toEqual([
      { id: "e1", nombreCompleto: "Emp Uno", produccionesAsignadas: 1 },
    ]);
  });

  test("rama: sin empleadoAsignadoId ni asignación legado para el estado actual, no cuenta", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargos: [] },
    ]);
    productionRepository.findAll.mockResolvedValue([
      { estado: "Corte", empleadoAsignaciones: { Compras: "e1" } },
    ]);

    const result = await getWorkload.execute();

    expect(result).toEqual([
      { id: "e1", nombreCompleto: "Emp Uno", produccionesAsignadas: 0 },
    ]);
  });

  test("rama: userRepository.findAll devuelve null/undefined -> se trata como sin empleados", async () => {
    userRepository.findAll.mockResolvedValue(null);
    productionRepository.findAll.mockResolvedValue([]);

    const result = await getWorkload.execute();

    expect(result).toEqual([]);
  });

  test("rama: productionRepository.findAll devuelve null/undefined -> nadie tiene órdenes contadas", async () => {
    userRepository.findAll.mockResolvedValue([
      { id: "e1", estado: true, rolNombre: "Empleado", nombreCompleto: "Emp Uno", cargos: [] },
    ]);
    productionRepository.findAll.mockResolvedValue(null);

    const result = await getWorkload.execute();

    expect(result).toEqual([
      { id: "e1", nombreCompleto: "Emp Uno", produccionesAsignadas: 0 },
    ]);
  });
});
