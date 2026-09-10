const CambiarEstadoProduction = require("../../../../src/application/use-cases/production/CambiarEstadoProduction");
const Production = require("../../../../src/domain/entities/Production");

jest.mock("../../../../src/shared/utils/emailService", () => ({
  sendProductionStageCompletedEmail: jest.fn().mockResolvedValue(true),
  sendProductionCompletedEmail: jest.fn().mockResolvedValue(true),
}));
const {
  sendProductionStageCompletedEmail,
  sendProductionCompletedEmail,
} = require("../../../../src/shared/utils/emailService");

function makeProduction(overrides = {}) {
  return {
    estado: "Diseño",
    empleadoAsignadoId: null,
    etapaConfirmada: false,
    numero_orden: 5,
    estaAnulada: jest.fn().mockReturnValue(false),
    ...overrides,
  };
}

function makeUpdated(overrides = {}) {
  return {
    numero_orden: 5,
    toJSON: () => ({ id: "orden1", estado: "Corte" }),
    ...overrides,
  };
}

describe("CambiarEstadoProduction", () => {
  let productionRepository;
  let userRepository;
  let cambiarEstado;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {
      findById: jest.fn().mockResolvedValue(makeProduction()),
      cambiarEstado: jest.fn().mockResolvedValue(makeUpdated()),
    };
    userRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    cambiarEstado = new CambiarEstadoProduction(productionRepository, userRepository);
  });

  test("rama: estado inválido -> 400", async () => {
    await expect(
      cambiarEstado.execute("id1", "EstadoQueNoExiste", "u1", {}),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(productionRepository.findById).not.toHaveBeenCalled();
  });

  test('rama: intentar poner "Anulada" por esta vía -> 422', async () => {
    await expect(
      cambiarEstado.execute("id1", "Anulada", "u1", {}),
    ).rejects.toMatchObject({
      message: "Para anular una orden usa el endpoint PATCH /ordenes/:id/anular",
      statusCode: 422,
    });
  });

  test("rama: orden no encontrada -> 404", async () => {
    productionRepository.findById.mockResolvedValue(null);

    await expect(
      cambiarEstado.execute("id1", "Corte", "u1", {}),
    ).rejects.toMatchObject({
      message: "Orden de producción no encontrada",
      statusCode: 404,
    });
  });

  test("rama: orden ya anulada -> 422", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estaAnulada: jest.fn().mockReturnValue(true) }),
    );

    await expect(
      cambiarEstado.execute("id1", "Corte", "u1", {}),
    ).rejects.toMatchObject({
      message: "No se puede cambiar el estado de una orden anulada",
      statusCode: 422,
    });
  });

  test("rama: sin force, retroceder el estado -> 422", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction({ estado: "Corte" }));

    await expect(
      cambiarEstado.execute("id1", "Diseño", "u1", {}),
    ).rejects.toMatchObject({
      message: "No se puede retroceder el estado sin autorización",
      statusCode: 422,
    });
  });

  test("rama: sin force, mantener el mismo estado -> 422", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction({ estado: "Corte" }));

    await expect(
      cambiarEstado.execute("id1", "Corte", "u1", {}),
    ).rejects.toMatchObject({ statusCode: 422 });
  });

  test("rama: con force=true se permite retroceder", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction({ estado: "Corte" }));

    const result = await cambiarEstado.execute("id1", "Diseño", "u1", {}, { force: true });

    expect(result).toEqual({ id: "orden1", estado: "Corte" });
  });

  test("rama: solicitante no privilegiado y no asignado -> 403", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Diseño", empleadoAsignadoId: "empX" }),
    );
    const solicitante = { id: "otro", rolNombre: "Administrador" };

    await expect(
      cambiarEstado.execute("id1", "Ficha Técnica", "u1", {}, { solicitante }),
    ).rejects.toMatchObject({
      message: "Solo el empleado asignado a esta etapa (o un gerente) puede avanzarla",
      statusCode: 403,
    });
  });

  test("rama: Gerente tiene bypass total aunque no sea el asignado", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Diseño", empleadoAsignadoId: "empX" }),
    );
    const solicitante = { id: "otro", rolNombre: "Gerente" };

    const result = await cambiarEstado.execute("id1", "Ficha Técnica", "u1", {}, { solicitante });

    expect(result).toEqual({ id: "orden1", estado: "Corte" });
  });

  test("rama: el empleado asignado sí puede avanzar su propia etapa", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Diseño", empleadoAsignadoId: "empX" }),
    );
    const solicitante = { id: "empX", rolNombre: "Empleado" };

    const result = await cambiarEstado.execute("id1", "Ficha Técnica", "u1", {}, { solicitante });

    expect(result).toEqual({ id: "orden1", estado: "Corte" });
  });

  test("rama: sin empleado asignado no se restringe por solicitante", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Diseño", empleadoAsignadoId: null }),
    );
    const solicitante = { id: "cualquiera", rolNombre: "Administrador" };

    const result = await cambiarEstado.execute("id1", "Ficha Técnica", "u1", {}, { solicitante });

    expect(result).toEqual({ id: "orden1", estado: "Corte" });
  });

  test("rama: etapa que requiere confirmación no confirmada por el empleado asignado -> 422", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Corte", empleadoAsignadoId: "empX", etapaConfirmada: false }),
    );

    await expect(
      cambiarEstado.execute("id1", "Compras", "u1", {}),
    ).rejects.toMatchObject({
      message:
        'La etapa "Corte" debe ser confirmada por el empleado asignado antes de poder avanzar.',
      statusCode: 422,
    });
  });

  test("rama: etapa confirmada permite avanzar", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Corte", empleadoAsignadoId: "empX", etapaConfirmada: true }),
    );

    const result = await cambiarEstado.execute("id1", "Compras", "u1", {});
    expect(result).toEqual({ id: "orden1", estado: "Corte" });
  });

  test("rama: force=true evita exigir confirmación de la etapa", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Corte", empleadoAsignadoId: "empX", etapaConfirmada: false }),
    );

    const result = await cambiarEstado.execute("id1", "Compras", "u1", {}, { force: true });
    expect(result).toEqual({ id: "orden1", estado: "Corte" });
  });

  test("rama: etapa que no requiere confirmación avanza sin problema", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Diseño", empleadoAsignadoId: "empX", etapaConfirmada: false }),
    );

    const result = await cambiarEstado.execute("id1", "Ficha Técnica", "u1", {});
    expect(result).toEqual({ id: "orden1", estado: "Corte" });
  });

  test("camino feliz: llama a cambiarEstado limpiando la asignación y reseteando etapaConfirmada", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction({ estado: "Diseño" }));
    const user = { id: "u1" };

    await cambiarEstado.execute("id1", "Ficha Técnica", "u1", user, { extra: { foo: "bar" } });

    expect(productionRepository.cambiarEstado).toHaveBeenCalledWith(
      "id1",
      "Ficha Técnica",
      "u1",
      user,
      { foo: "bar", empleadoAsignadoId: null, etapaConfirmada: false },
    );
  });

  test("rama: sin empleado que termina, no se dispara notificación de check-in", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Diseño", empleadoAsignadoId: null }),
    );
    const spy = jest.spyOn(cambiarEstado, "_notificarCheckIn");

    await cambiarEstado.execute("id1", "Ficha Técnica", "u1", {});

    expect(spy).not.toHaveBeenCalled();
  });

  test("rama: sin userRepository inyectado, no se dispara notificación de check-in", async () => {
    const sinUserRepo = new CambiarEstadoProduction(productionRepository, null);
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Diseño", empleadoAsignadoId: "empX" }),
    );

    await expect(
      sinUserRepo.execute("id1", "Ficha Técnica", "u1", {}),
    ).resolves.toEqual({ id: "orden1", estado: "Corte" });
  });

  test("camino feliz: con empleado que termina y userRepository, se dispara _notificarCheckIn", async () => {
    productionRepository.findById.mockResolvedValue(
      makeProduction({ estado: "Diseño", empleadoAsignadoId: "empX" }),
    );
    const spy = jest.spyOn(cambiarEstado, "_notificarCheckIn").mockResolvedValue();

    await cambiarEstado.execute("id1", "Ficha Técnica", "u1", {});

    expect(spy).toHaveBeenCalledWith("empX", expect.any(Object), "Diseño");
  });

  test("rama: nuevoEstado 'Enviado' sin clientRepository inyectado, no se dispara notificación al cliente", async () => {
    productionRepository.findById.mockResolvedValue(makeProduction({ estado: "Recepción" }));

    await expect(
      cambiarEstado.execute("id1", "Enviado", "u1", {}),
    ).resolves.toEqual({ id: "orden1", estado: "Corte" });
  });

  test("rama: nuevoEstado distinto de 'Enviado' no dispara notificación al cliente aunque haya clientRepository", async () => {
    const clientRepository = { findByNombre: jest.fn() };
    const conCliente = new CambiarEstadoProduction(
      productionRepository,
      userRepository,
      clientRepository,
    );
    productionRepository.findById.mockResolvedValue(makeProduction({ estado: "Diseño" }));

    await conCliente.execute("id1", "Ficha Técnica", "u1", {});

    expect(clientRepository.findByNombre).not.toHaveBeenCalled();
  });

  test("camino feliz: nuevoEstado 'Enviado' con clientRepository, se dispara _notificarCliente", async () => {
    const clientRepository = { findByNombre: jest.fn() };
    const conCliente = new CambiarEstadoProduction(
      productionRepository,
      userRepository,
      clientRepository,
    );
    productionRepository.findById.mockResolvedValue(makeProduction({ estado: "Recepción" }));
    const spy = jest.spyOn(conCliente, "_notificarCliente").mockResolvedValue();

    const updated = makeUpdated();
    productionRepository.cambiarEstado.mockResolvedValue(updated);

    await conCliente.execute("id1", "Enviado", "u1", {});

    expect(spy).toHaveBeenCalledWith(updated);
  });

  test("rama: un fallo al enviar el correo al cliente no rompe el cambio de estado (fire-and-forget)", async () => {
    const clientRepository = { findByNombre: jest.fn() };
    const conCliente = new CambiarEstadoProduction(
      productionRepository,
      userRepository,
      clientRepository,
    );
    productionRepository.findById.mockResolvedValue(makeProduction({ estado: "Recepción" }));
    jest.spyOn(conCliente, "_notificarCliente").mockRejectedValue(new Error("SMTP caído"));
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    const result = await conCliente.execute("id1", "Enviado", "u1", {});
    await Promise.resolve();
    await Promise.resolve();

    expect(result).toEqual({ id: "orden1", estado: "Corte" });
    consoleSpy.mockRestore();
  });
});

describe("CambiarEstadoProduction._notificarCliente", () => {
  let clientRepository;
  let siteRepository;
  let cambiarEstado;

  beforeEach(() => {
    jest.clearAllMocks();
    clientRepository = { findByNombre: jest.fn() };
    siteRepository = { findById: jest.fn() };
    cambiarEstado = new CambiarEstadoProduction({}, {}, clientRepository, siteRepository);
  });

  test("rama: cliente no encontrado -> no envía correo", async () => {
    clientRepository.findByNombre.mockResolvedValue(null);

    await cambiarEstado._notificarCliente({ cliente: "Acme" });

    expect(sendProductionCompletedEmail).not.toHaveBeenCalled();
  });

  test("rama: cliente sin correo -> no envía correo", async () => {
    clientRepository.findByNombre.mockResolvedValue({ nombre: "Acme", correo: null });

    await cambiarEstado._notificarCliente({ cliente: "Acme" });

    expect(sendProductionCompletedEmail).not.toHaveBeenCalled();
  });

  test("rama: sedeAsignaciones como arreglo de strings", async () => {
    clientRepository.findByNombre.mockResolvedValue({ nombre: "Acme", correo: "a@a.com" });

    await cambiarEstado._notificarCliente({
      cliente: "Acme",
      numero_orden: 9,
      sedeAsignaciones: [" Sede Norte ", "Sede Sur"],
    });

    expect(sendProductionCompletedEmail).toHaveBeenCalledWith({
      nombreCliente: "Acme",
      correo: "a@a.com",
      numeroOrden: 9,
      sedeDestino: "Sede Norte, Sede Sur",
    });
  });

  test("rama: sedeAsignaciones como arreglo de objetos (option/nombre)", async () => {
    clientRepository.findByNombre.mockResolvedValue({ nombre: "Acme", correo: "a@a.com" });

    await cambiarEstado._notificarCliente({
      cliente: "Acme",
      numero_orden: 9,
      sedeAsignaciones: [{ option: "Sede Norte" }, { nombre: "Sede Sur" }, {}],
    });

    expect(sendProductionCompletedEmail).toHaveBeenCalledWith({
      nombreCliente: "Acme",
      correo: "a@a.com",
      numeroOrden: 9,
      sedeDestino: "Sede Norte, Sede Sur",
    });
  });

  test("rama: sin sedeAsignaciones ni sedeId -> sedeDestino 'No especificada'", async () => {
    clientRepository.findByNombre.mockResolvedValue({ nombre: "Acme", correo: "a@a.com" });

    await cambiarEstado._notificarCliente({ cliente: "Acme", numero_orden: 9 });

    expect(sendProductionCompletedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ sedeDestino: "No especificada" }),
    );
  });

  test("rama: sin sedeAsignaciones pero con sedeId y siteRepository, busca el nombre de la sede", async () => {
    clientRepository.findByNombre.mockResolvedValue({ nombre: "Acme", correo: "a@a.com" });
    siteRepository.findById.mockResolvedValue({ nombre: "Sede Central" });

    await cambiarEstado._notificarCliente({ cliente: "Acme", numero_orden: 9, sedeId: "s1" });

    expect(siteRepository.findById).toHaveBeenCalledWith("s1");
    expect(sendProductionCompletedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ sedeDestino: "Sede Central" }),
    );
  });

  test("rama: sedeId sin siteRepository inyectado, no intenta buscar la sede", async () => {
    clientRepository.findByNombre.mockResolvedValue({ nombre: "Acme", correo: "a@a.com" });
    const sinSiteRepo = new CambiarEstadoProduction({}, {}, clientRepository, null);

    await sinSiteRepo._notificarCliente({ cliente: "Acme", numero_orden: 9, sedeId: "s1" });

    expect(sendProductionCompletedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ sedeDestino: "No especificada" }),
    );
  });

  test("rama: sedeId con siteRepository pero la sede no existe -> 'No especificada'", async () => {
    clientRepository.findByNombre.mockResolvedValue({ nombre: "Acme", correo: "a@a.com" });
    siteRepository.findById.mockResolvedValue(null);

    await cambiarEstado._notificarCliente({ cliente: "Acme", numero_orden: 9, sedeId: "s1" });

    expect(sendProductionCompletedEmail).toHaveBeenCalledWith(
      expect.objectContaining({ sedeDestino: "No especificada" }),
    );
  });
});

describe("CambiarEstadoProduction._notificarCheckIn", () => {
  let productionRepository;
  let userRepository;
  let cambiarEstado;

  beforeEach(() => {
    jest.clearAllMocks();
    productionRepository = {};
    userRepository = {
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    cambiarEstado = new CambiarEstadoProduction(productionRepository, userRepository);
  });

  test("rama: empleado no encontrado -> no envía correo", async () => {
    userRepository.findById.mockResolvedValue(null);

    await cambiarEstado._notificarCheckIn("empX", makeUpdated(), "Diseño");

    expect(sendProductionStageCompletedEmail).not.toHaveBeenCalled();
  });

  test("rama: empleado sin sedeId -> no envía correo", async () => {
    userRepository.findById.mockResolvedValue({ sedeId: null });

    await cambiarEstado._notificarCheckIn("empX", makeUpdated(), "Diseño");

    expect(sendProductionStageCompletedEmail).not.toHaveBeenCalled();
  });

  test("rama: no hay administrador en la sede -> no envía correo", async () => {
    userRepository.findById.mockResolvedValue({ sedeId: "sedeA", nombreCompleto: "Emp" });
    userRepository.findAll.mockResolvedValue([{ rolNombre: "Empleado", correo: "x@x.com" }]);

    await cambiarEstado._notificarCheckIn("empX", makeUpdated(), "Diseño");

    expect(sendProductionStageCompletedEmail).not.toHaveBeenCalled();
  });

  test("rama: administrador sin correo -> no envía correo", async () => {
    userRepository.findById.mockResolvedValue({ sedeId: "sedeA", nombreCompleto: "Emp" });
    userRepository.findAll.mockResolvedValue([{ rolNombre: "Administrador", correo: null }]);

    await cambiarEstado._notificarCheckIn("empX", makeUpdated(), "Diseño");

    expect(sendProductionStageCompletedEmail).not.toHaveBeenCalled();
  });

  test("camino feliz: administrador de la sede con correo recibe la notificación", async () => {
    userRepository.findById.mockResolvedValue({ sedeId: "sedeA", nombreCompleto: "Empleado Uno" });
    userRepository.findAll.mockResolvedValue([
      { rolNombre: " Administrador ", correo: "admin@unistock.com", nombreCompleto: "Admin Sede" },
    ]);

    await cambiarEstado._notificarCheckIn("empX", makeUpdated({ numero_orden: 12 }), "Corte");

    expect(sendProductionStageCompletedEmail).toHaveBeenCalledWith({
      nombreCompleto: "Admin Sede",
      correo: "admin@unistock.com",
      numeroOrden: 12,
      etapaCompletada: "Corte",
      empleadoNombre: "Empleado Uno",
    });
  });
});
