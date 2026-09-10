const ConfirmarEtapaProduccion = require("../../../../src/application/use-cases/production/ConfirmarEtapaProduccion");

jest.mock("../../../../src/shared/utils/emailService", () => ({
  sendProductionStageCompletedEmail: jest.fn().mockResolvedValue(true),
}));
jest.mock("../../../../src/infrastructure/db/RoleModel", () => ({
  findOne: jest.fn(),
}));

const { sendProductionStageCompletedEmail } = require("../../../../src/shared/utils/emailService");
const RoleModel = require("../../../../src/infrastructure/db/RoleModel");

function makeProduction(overrides = {}) {
  return {
    estado: "Corte",
    empleadoAsignadoId: "emp1",
    etapaConfirmada: false,
    numero_orden: 7,
    estaAnulada: jest.fn().mockReturnValue(false),
    ...overrides,
  };
}

describe("ConfirmarEtapaProduccion.execute", () => {
  let productionRepository;
  let userRepository;
  let confirmar;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {
      findById: jest.fn().mockResolvedValue(makeProduction()),
      update: jest.fn().mockResolvedValue({
        toJSON: () => ({ id: "orden1", etapaConfirmada: true }),
      }),
      agregarHistorial: jest.fn().mockResolvedValue(true),
    };
    userRepository = {
      findById: jest.fn().mockResolvedValue({ nombreCompleto: "Empleado Uno" }),
      findAll: jest.fn().mockResolvedValue([]),
    };
    confirmar = new ConfirmarEtapaProduccion(productionRepository, userRepository);
  });

  test("rama: sin solicitanteId -> 401", async () => {
    await expect(confirmar.execute("orden1", null)).rejects.toMatchObject({
      message: "No se pudo identificar al usuario solicitante",
      statusCode: 401,
    });
  });

  test("rama: orden no encontrada -> 404", async () => {
    productionRepository.findById.mockResolvedValue(null);

    await expect(confirmar.execute("orden1", "emp1")).rejects.toMatchObject({
      message: "Orden de producción no encontrada",
      statusCode: 404,
    });
  });

  test("rama: orden anulada -> 422", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estaAnulada: jest.fn().mockReturnValue(true) }),
    );

    await expect(confirmar.execute("orden1", "emp1")).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  test("rama: etapa no asignable -> 422", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction({ estado: "Enviado" }));

    await expect(confirmar.execute("orden1", "emp1")).rejects.toMatchObject({
      statusCode: 422,
    });
  });

  test("rama: sin empleado asignado -> 422", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ empleadoAsignadoId: null }),
    );

    await expect(confirmar.execute("orden1", "emp1")).rejects.toMatchObject({
      message:
        "No hay un empleado asignado a esta etapa. El Gerente debe asignar a alguien primero.",
      statusCode: 422,
    });
  });

  test("rama: solicitante distinto del empleado asignado -> 403", async () => {
    await expect(confirmar.execute("orden1", "otroEmpleado")).rejects.toMatchObject({
      message: "Solo el empleado asignado a esta etapa puede confirmar su finalización.",
      statusCode: 403,
    });
  });

  test("rama: etapa ya confirmada -> 422", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction({ etapaConfirmada: true }));

    await expect(confirmar.execute("orden1", "emp1")).rejects.toMatchObject({
      message: "La etapa ya fue confirmada anteriormente.",
      statusCode: 422,
    });
  });

  test("rama: si update falla (devuelve falsy) -> 500", async () => {
    productionRepository.update.mockResolvedValue(null);

    await expect(confirmar.execute("orden1", "emp1")).rejects.toMatchObject({
      message: "Error al confirmar la etapa",
      statusCode: 500,
    });
    expect(productionRepository.agregarHistorial).not.toHaveBeenCalled();
  });

  test("camino feliz: marca etapaConfirmada, agrega historial y devuelve toJSON()", async () => {
    const result = await confirmar.execute("orden1", "emp1", "Empleado Uno");

    expect(productionRepository.update).toHaveBeenCalledWith("orden1", { etapaConfirmada: true });
    expect(productionRepository.agregarHistorial).toHaveBeenCalledWith(
      "orden1",
      "Empleado Uno confirmó finalización de la etapa",
      "emp1",
      "Empleado Uno",
      "Corte",
    );
    expect(result).toEqual({ id: "orden1", etapaConfirmada: true });
  });

  test("camino feliz: sin nombre de solicitante, usa 'El empleado' por defecto", async () => {
    await confirmar.execute("orden1", "emp1");

    expect(productionRepository.agregarHistorial).toHaveBeenCalledWith(
      "orden1",
      "El empleado confirmó finalización de la etapa",
      "emp1",
      "El empleado",
      "Corte",
    );
  });

  test("camino feliz: dispara la notificación a gerentes tras confirmar", async () => {
    const spy = jest.spyOn(confirmar, "_notificarGerentes").mockResolvedValue();

    await confirmar.execute("orden1", "emp1", "Empleado Uno");

    expect(spy).toHaveBeenCalledWith(expect.any(Object), "emp1");
  });
});

describe("ConfirmarEtapaProduccion._notificarGerentes", () => {
  let productionRepository;
  let userRepository;
  let confirmar;
  const production = makeProduction({ numero_orden: 9 });

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {};
    userRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    confirmar = new ConfirmarEtapaProduccion(productionRepository, userRepository);
  });

  test("rama: sin userRepository, no hace nada", async () => {
    const sinUserRepo = new ConfirmarEtapaProduccion(productionRepository, null);

    await sinUserRepo._notificarGerentes(production, "emp1");

    expect(RoleModel.findOne).not.toHaveBeenCalled();
  });

  test("rama: si falla la búsqueda del empleado, usa nombre por defecto y continúa", async () => {
    userRepository.findById.mockRejectedValue(new Error("DB caída"));
    RoleModel.findOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "rolGerente" }) });
    userRepository.findAll.mockResolvedValue([
      { correo: "gerente@unistock.com", nombreCompleto: "Gerente Uno" },
    ]);

    await confirmar._notificarGerentes(production, "emp1");

    expect(sendProductionStageCompletedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ empleadoNombre: "El empleado" }),
    );
  });

  test("rama: si no se encuentra el rol Gerente, no notifica a nadie", async () => {
    userRepository.findById.mockResolvedValue({ nombreCompleto: "Emp" });
    RoleModel.findOne.mockReturnValue({ lean: () => Promise.resolve(null) });

    await confirmar._notificarGerentes(production, "emp1");

    expect(sendProductionStageCompletedEmail).not.toHaveBeenCalled();
  });

  test("rama: si falla la búsqueda del rol, no notifica a nadie", async () => {
    userRepository.findById.mockResolvedValue({ nombreCompleto: "Emp" });
    RoleModel.findOne.mockReturnValue({ lean: () => Promise.reject(new Error("DB caída")) });

    await confirmar._notificarGerentes(production, "emp1");

    expect(sendProductionStageCompletedEmail).not.toHaveBeenCalled();
  });

  test("rama: si falla la búsqueda de gerentes, no notifica a nadie", async () => {
    userRepository.findById.mockResolvedValue({ nombreCompleto: "Emp" });
    RoleModel.findOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "rolGerente" }) });
    userRepository.findAll.mockRejectedValue(new Error("DB caída"));

    await confirmar._notificarGerentes(production, "emp1");

    expect(sendProductionStageCompletedEmail).not.toHaveBeenCalled();
  });

  test("rama: sin gerentes registrados, no notifica a nadie", async () => {
    userRepository.findById.mockResolvedValue({ nombreCompleto: "Emp" });
    RoleModel.findOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "rolGerente" }) });
    userRepository.findAll.mockResolvedValue([]);

    await confirmar._notificarGerentes(production, "emp1");

    expect(sendProductionStageCompletedEmail).not.toHaveBeenCalled();
  });

  test("rama: gerentes sin correo se omiten", async () => {
    userRepository.findById.mockResolvedValue({ nombreCompleto: "Emp" });
    RoleModel.findOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "rolGerente" }) });
    userRepository.findAll.mockResolvedValue([{ correo: null, nombreCompleto: "Gerente Sin Correo" }]);

    await confirmar._notificarGerentes(production, "emp1");

    expect(sendProductionStageCompletedEmail).not.toHaveBeenCalled();
  });

  test("rama: si el envío a un gerente falla, se continúa con los demás", async () => {
    userRepository.findById.mockResolvedValue({ nombreCompleto: "Emp" });
    RoleModel.findOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "rolGerente" }) });
    userRepository.findAll.mockResolvedValue([
      { correo: "g1@unistock.com", nombreCompleto: "Gerente Uno" },
      { correo: "g2@unistock.com", nombreCompleto: "Gerente Dos" },
    ]);
    sendProductionStageCompletedEmail
      .mockRejectedValueOnce(new Error("SMTP caído"))
      .mockResolvedValueOnce(true);

    await confirmar._notificarGerentes(production, "emp1");

    expect(sendProductionStageCompletedEmail).toHaveBeenCalledTimes(2);
  });

  test("camino feliz: notifica a todos los gerentes con correo", async () => {
    userRepository.findById.mockResolvedValue({ nombreCompleto: "Empleado Uno" });
    RoleModel.findOne.mockReturnValue({ lean: () => Promise.resolve({ _id: "rolGerente" }) });
    userRepository.findAll.mockResolvedValue([
      { correo: "g1@unistock.com", nombreCompleto: "Gerente Uno" },
    ]);

    await confirmar._notificarGerentes(production, "emp1");

    expect(sendProductionStageCompletedEmail).toHaveBeenCalledWith({
      nombreCompleto: "Gerente Uno",
      correo: "g1@unistock.com",
      numeroOrden: 9,
      etapaCompletada: "Corte",
      empleadoNombre: "Empleado Uno",
    });
  });
});
