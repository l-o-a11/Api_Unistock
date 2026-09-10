const AsignarEmpleadoProduccion = require("../../../../src/application/use-cases/production/AsignarEmpleadoProduccion");

jest.mock("../../../../src/shared/utils/emailService", () => ({
  sendProductionAssignedEmail: jest.fn().mockResolvedValue(true),
}));
const { sendProductionAssignedEmail } = require("../../../../src/shared/utils/emailService");

function makeOrden(overrides = {}) {
  return {
    estado: "Corte",
    sedeId: "sedeA",
    estaAnulada: jest.fn().mockReturnValue(false),
    ...overrides,
  };
}

function makeEmpleado(overrides = {}) {
  return {
    id: "emp1",
    nombreCompleto: "Juan Pérez",
    correo: "juan@unistock.com",
    estado: true,
    rolNombre: "Empleado",
    cargo: ["Corte"],
    sedeId: "sedeA",
    ...overrides,
  };
}

describe("AsignarEmpleadoProduccion", () => {
  let productionRepository;
  let userRepository;
  let asignar;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {
      findById: jest.fn().mockResolvedValue(makeOrden()),
      update: jest.fn().mockResolvedValue({
        numero_orden: 10,
        toJSON: () => ({ id: "orden1", empleadoAsignadoId: "emp1" }),
      }),
    };
    userRepository = {
      findById: jest.fn().mockResolvedValue(makeEmpleado()),
    };
    asignar = new AsignarEmpleadoProduccion(productionRepository, userRepository);
  });

  test("rama: orden no encontrada -> 404", async () => {
    productionRepository.findById.mockResolvedValue(null);

    await expect(asignar.execute("orden1", "emp1")).rejects.toMatchObject({
      message: "Orden de producción no encontrada",
      statusCode: 404,
    });
  });

  test("rama: orden anulada -> 422", async () => {
    productionRepository.findById.mockResolvedValue(
      makeOrden({ estaAnulada: jest.fn().mockReturnValue(true) }),
    );

    await expect(asignar.execute("orden1", "emp1")).rejects.toMatchObject({
      message: "No se puede asignar empleados a una orden anulada",
      statusCode: 422,
    });
  });

  test("rama: empleado no encontrado -> 404", async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(asignar.execute("orden1", "empX")).rejects.toMatchObject({
      message: "Empleado no encontrado",
      statusCode: 404,
    });
  });

  test("rama: empleado inactivo -> 422", async () => {
    userRepository.findById.mockResolvedValue(makeEmpleado({ estado: false }));

    await expect(asignar.execute("orden1", "emp1")).rejects.toMatchObject({
      message: "El empleado seleccionado está inactivo",
      statusCode: 422,
    });
  });

  test("rama: rol distinto de Empleado -> 422", async () => {
    userRepository.findById.mockResolvedValue(makeEmpleado({ rolNombre: "Administrador" }));

    await expect(asignar.execute("orden1", "emp1")).rejects.toMatchObject({
      message: 'Solo se pueden asignar usuarios con rol "Empleado"',
      statusCode: 422,
    });
  });

  test("rama: rol Empleado con tildes/mayúsculas distintas sigue siendo válido", async () => {
    userRepository.findById.mockResolvedValue(makeEmpleado({ rolNombre: "  EMPLEADO  " }));

    const result = await asignar.execute("orden1", "emp1");
    expect(result).toEqual({ id: "orden1", empleadoAsignadoId: "emp1" });
  });

  test("rama: cargo no coincide con la etapa actual -> 422", async () => {
    userRepository.findById.mockResolvedValue(makeEmpleado({ cargo: ["Compras"] }));

    await expect(asignar.execute("orden1", "emp1")).rejects.toMatchObject({
      message: 'El empleado debe tener el cargo "Corte" para asignarlo a esta etapa',
      statusCode: 422,
    });
  });

  test("rama: cargo como string único (no arreglo) que sí coincide, ignorando tildes", async () => {
    productionRepository.findById.mockResolvedValue(makeOrden({ estado: "Producción" }));
    userRepository.findById.mockResolvedValue(makeEmpleado({ cargo: "produccion" }));

    const result = await asignar.execute("orden1", "emp1");
    expect(result).toEqual({ id: "orden1", empleadoAsignadoId: "emp1" });
  });

  test("rama: empleado de otra sede -> 422", async () => {
    userRepository.findById.mockResolvedValue(makeEmpleado({ sedeId: "sedeB" }));

    await expect(asignar.execute("orden1", "emp1")).rejects.toMatchObject({
      message: "El empleado debe pertenecer a la misma sede que la producción",
      statusCode: 422,
    });
  });

  test("rama: si la orden no tiene sedeId, no se valida la sede del empleado", async () => {
    productionRepository.findById.mockResolvedValue(makeOrden({ sedeId: null }));
    userRepository.findById.mockResolvedValue(makeEmpleado({ sedeId: "sedeCualquiera" }));

    const result = await asignar.execute("orden1", "emp1");
    expect(result).toEqual({ id: "orden1", empleadoAsignadoId: "emp1" });
  });

  test("camino feliz: asigna al empleado y envía correo de notificación", async () => {
    const result = await asignar.execute("orden1", "emp1");

    expect(productionRepository.update).toHaveBeenCalledWith("orden1", {
      empleadoAsignadoId: "emp1",
    });
    expect(result).toEqual({ id: "orden1", empleadoAsignadoId: "emp1" });
    expect(sendProductionAssignedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ correo: "juan@unistock.com", numeroOrden: 10, etapa: "Corte" }),
    );
  });

  test("rama: si el empleado no tiene correo, no se intenta enviar notificación", async () => {
    userRepository.findById.mockResolvedValue(makeEmpleado({ correo: null }));

    await asignar.execute("orden1", "emp1");

    expect(sendProductionAssignedEmail).not.toHaveBeenCalled();
  });

  test("rama: un fallo al enviar el correo no rompe la asignación (fire-and-forget)", async () => {
    sendProductionAssignedEmail.mockRejectedValueOnce(new Error("SMTP caído"));

    const result = await asignar.execute("orden1", "emp1");

    expect(result).toEqual({ id: "orden1", empleadoAsignadoId: "emp1" });
  });
});
