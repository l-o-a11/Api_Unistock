const ReasignarEmpleadoProduccion = require("../../../../src/application/use-cases/production/ReasignarEmpleadoProduccion");

jest.mock("../../../../src/shared/utils/emailService", () => ({
  sendProductionAssignedEmail: jest.fn().mockResolvedValue(true),
}));
const { sendProductionAssignedEmail } = require("../../../../src/shared/utils/emailService");

function makeOrden(overrides = {}) {
  return {
    estado: "Corte",
    sedeId: "sedeA",
    empleadoAsignadoId: "empAnterior",
    estaAnulada: jest.fn().mockReturnValue(false),
    ...overrides,
  };
}

function makeEmpleado(overrides = {}) {
  return {
    id: "empNuevo",
    nombreCompleto: "Nuevo Empleado",
    correo: "nuevo@unistock.com",
    estado: true,
    rolNombre: "Empleado",
    cargo: ["Corte"],
    sedeId: "sedeA",
    ...overrides,
  };
}

describe("ReasignarEmpleadoProduccion", () => {
  let productionRepository;
  let userRepository;
  let reasignar;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {
      findById: jest.fn().mockResolvedValue(makeOrden()),
      update: jest.fn().mockResolvedValue({
        numero_orden: 8,
        toJSON: () => ({ id: "orden1", empleadoAsignadoId: "empNuevo" }),
      }),
      agregarHistorial: jest.fn().mockResolvedValue(true),
    };
    userRepository = {
      findById: jest.fn().mockImplementation(async (id) => {
        if (id === "empAnterior") {
          return makeEmpleado({
            id: "empAnterior",
            nombreCompleto: "Empleado Anterior",
            correo: "anterior@unistock.com",
          });
        }
        return makeEmpleado();
      }),
    };
    reasignar = new ReasignarEmpleadoProduccion(productionRepository, userRepository);
  });

  test("rama: orden no encontrada -> 404", async () => {
    productionRepository.findById.mockResolvedValue(null);

    await expect(
      reasignar.execute("orden1", "empNuevo", "Justificación válida"),
    ).rejects.toMatchObject({
      message: "Orden de producción no encontrada",
      statusCode: 404,
    });
  });

  test("rama: orden anulada -> 422", async () => {
    productionRepository.findById.mockResolvedValue(
      makeOrden({ estaAnulada: jest.fn().mockReturnValue(true) }),
    );

    await expect(
      reasignar.execute("orden1", "empNuevo", "Justificación válida"),
    ).rejects.toMatchObject({
      message: "No se puede reasignar empleados en una orden anulada",
      statusCode: 422,
    });
  });

  test("rama: motivo ausente -> 422", async () => {
    await expect(reasignar.execute("orden1", "empNuevo", undefined)).rejects.toMatchObject({
      message: "La justificación del cambio es requerida (mínimo 5 caracteres)",
      statusCode: 422,
    });
  });

  test("rama: motivo demasiado corto -> 422", async () => {
    await expect(reasignar.execute("orden1", "empNuevo", "abc")).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  test("rama: nuevo empleado no encontrado -> 404", async () => {
    userRepository.findById.mockImplementation(async (id) =>
      id === "empAnterior"
        ? { id: "empAnterior", nombreCompleto: "Empleado Anterior", correo: "anterior@unistock.com" }
        : null,
    );

    await expect(
      reasignar.execute("orden1", "empInexistente", "Justificación válida"),
    ).rejects.toMatchObject({
      message: "Empleado no encontrado",
      statusCode: 404,
    });
  });

  test("rama: nuevo empleado inactivo -> 422", async () => {
    userRepository.findById.mockImplementation(async (id) =>
      id === "empAnterior"
        ? { id: "empAnterior", nombreCompleto: "Empleado Anterior", correo: "anterior@unistock.com" }
        : makeEmpleado({ estado: false }),
    );

    await expect(
      reasignar.execute("orden1", "empNuevo", "Justificación válida"),
    ).rejects.toMatchObject({
      message: "El empleado seleccionado está inactivo",
      statusCode: 422,
    });
  });

  test("rama: nuevo empleado con rol distinto de Empleado -> 422", async () => {
    userRepository.findById.mockImplementation(async (id) =>
      id === "empAnterior"
        ? { id: "empAnterior", nombreCompleto: "Empleado Anterior", correo: "anterior@unistock.com" }
        : makeEmpleado({ rolNombre: "Administrador" }),
    );

    await expect(
      reasignar.execute("orden1", "empNuevo", "Justificación válida"),
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  test("rama: cargo del nuevo empleado no coincide con la etapa -> 422", async () => {
    userRepository.findById.mockImplementation(async (id) =>
      id === "empAnterior"
        ? { id: "empAnterior", nombreCompleto: "Empleado Anterior", correo: "anterior@unistock.com" }
        : makeEmpleado({ cargo: ["Compras"] }),
    );

    await expect(
      reasignar.execute("orden1", "empNuevo", "Justificación válida"),
    ).rejects.toMatchObject({
      message: 'El empleado debe tener el cargo "Corte" para asignarlo a esta etapa',
      statusCode: 422,
    });
  });

  test("rama: nuevo empleado de otra sede -> 422", async () => {
    userRepository.findById.mockImplementation(async (id) =>
      id === "empAnterior"
        ? { id: "empAnterior", nombreCompleto: "Empleado Anterior", correo: "anterior@unistock.com" }
        : makeEmpleado({ sedeId: "sedeB" }),
    );

    await expect(
      reasignar.execute("orden1", "empNuevo", "Justificación válida"),
    ).rejects.toMatchObject({
      message: "El empleado debe pertenecer a la misma sede que la producción",
      statusCode: 422,
    });
  });

  test("rama: el nuevo empleado es el mismo que ya estaba asignado -> 422", async () => {
    await expect(
      reasignar.execute("orden1", "empAnterior", "Justificación válida"),
    ).rejects.toMatchObject({
      message: "El empleado seleccionado ya está asignado a esta orden",
      statusCode: 422,
    });
  });

  test("camino feliz: reasigna, registra historial y notifica a ambos empleados por correo", async () => {
    const result = await reasignar.execute(
      "orden1",
      "empNuevo",
      "Cambio de turno",
      "gerente1",
      "Gerente Uno",
    );

    expect(productionRepository.update).toHaveBeenCalledWith("orden1", {
      empleadoAsignadoId: "empNuevo",
    });
    expect(productionRepository.agregarHistorial).toHaveBeenCalledWith(
      "orden1",
      "Reasignado de Empleado Anterior a Nuevo Empleado por Gerente Uno. Motivo: Cambio de turno",
      "gerente1",
      "Gerente Uno",
      "Corte",
    );
    expect(sendProductionAssignedEmail).toHaveBeenCalledTimes(2);
    expect(result).toMatchObject({
      id: "orden1",
      empleadoAnteriorNombre: "Empleado Anterior",
      empleadoNuevoNombre: "Nuevo Empleado",
      quienReasigna: "Gerente Uno",
      justificacion: "Cambio de turno",
    });
  });

  test("rama: sin empleado anterior asignado, usa 'Sin asignar' y no envía correo de desasignación", async () => {
    productionRepository.findById.mockResolvedValue(makeOrden({ empleadoAsignadoId: null }));

    const result = await reasignar.execute("orden1", "empNuevo", "Primera asignación");

    expect(result.empleadoAnteriorNombre).toBe("Sin asignar");
    expect(sendProductionAssignedEmail).toHaveBeenCalledTimes(1);
  });

  test("rama: sin solicitanteNombre, usa 'Sistema' por defecto en el historial", async () => {
    await reasignar.execute("orden1", "empNuevo", "Justificación válida");

    expect(productionRepository.agregarHistorial).toHaveBeenCalledWith(
      "orden1",
      expect.stringContaining("por Sistema."),
      null,
      "Sistema",
      "Corte",
    );
  });

  test("rama: si el nuevo empleado no tiene correo, no se le envía notificación", async () => {
    userRepository.findById.mockImplementation(async (id) =>
      id === "empAnterior"
        ? { id: "empAnterior", nombreCompleto: "Empleado Anterior", correo: "anterior@unistock.com" }
        : makeEmpleado({ correo: null }),
    );

    await reasignar.execute("orden1", "empNuevo", "Justificación válida");

    expect(sendProductionAssignedEmail).toHaveBeenCalledTimes(1);
  });

  test("rama: si falla la búsqueda del empleado anterior, se continúa sin romper (catch -> null)", async () => {
    userRepository.findById.mockImplementation(async (id) => {
      if (id === "empAnterior") throw new Error("DB caída");
      return makeEmpleado();
    });

    const result = await reasignar.execute("orden1", "empNuevo", "Justificación válida");

    expect(result.empleadoAnteriorNombre).toBe("Sin asignar");
  });
});
