jest.mock("../../../src/infrastructure/security/token_generator", () => ({
  verify: jest.fn(),
}));
jest.mock("../../../src/infrastructure/repositories/UserRepository", () => {
  return jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
  }));
});
jest.mock("../../../src/infrastructure/db/RoleModel", () => ({
  findById: jest.fn(),
}));

const { verify } = require("../../../src/infrastructure/security/token_generator");
const RoleModel = require("../../../src/infrastructure/db/RoleModel");
const {
  requireAuth,
  requireRole,
  requirePermission,
} = require("../../../src/interfaces/middlewares/authMiddleware");

// authMiddleware instancia su propio UserRepository internamente (new UserRepository()),
// así que accedemos a esa instancia mockeada a través del mock del módulo.
const UserRepository = require("../../../src/infrastructure/repositories/UserRepository");
const userRepoInstance = UserRepository.mock.results[0].value;

function makeRes() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("authMiddleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("requireAuth", () => {
    test("rama: sin header Authorization -> 401", async () => {
      const req = { headers: {} };
      const res = makeRes();
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test("rama: header sin prefijo 'Bearer ' -> 401", async () => {
      const req = { headers: { authorization: "Token abc" } };
      const res = makeRes();
      const next = jest.fn();

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test("rama: token expirado -> 401 con mensaje específico", async () => {
      const req = { headers: { authorization: "Bearer tokExpirado" } };
      const res = makeRes();
      const next = jest.fn();
      const err = new Error("expirado");
      err.name = "TokenExpiredError";
      verify.mockImplementation(() => {
        throw err;
      });

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "El token ha expirado" }),
      );
    });

    test("rama: token con firma inválida -> 401 con mensaje genérico", async () => {
      const req = { headers: { authorization: "Bearer tokMalo" } };
      const res = makeRes();
      const next = jest.fn();
      verify.mockImplementation(() => {
        throw new Error("firma inválida");
      });

      await requireAuth(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Token inválido" }),
      );
    });

    test("rama: usuario del token ya no existe en BD -> 401", async () => {
      const req = { headers: { authorization: "Bearer tokValido" } };
      const res = makeRes();
      const next = jest.fn();
      verify.mockReturnValue({ id: "u1" });
      userRepoInstance.findById.mockResolvedValue(null);

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test("rama: usuario del token está desactivado en BD -> 401", async () => {
      const req = { headers: { authorization: "Bearer tokValido" } };
      const res = makeRes();
      const next = jest.fn();
      verify.mockReturnValue({ id: "u1" });
      userRepoInstance.findById.mockResolvedValue({ estado: false });

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test("rama: error inesperado consultando la BD -> 500", async () => {
      const req = { headers: { authorization: "Bearer tokValido" } };
      const res = makeRes();
      const next = jest.fn();
      verify.mockReturnValue({ id: "u1" });
      userRepoInstance.findById.mockRejectedValue(new Error("Mongo caído"));
      jest.spyOn(console, "error").mockImplementation(() => {});

      await requireAuth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("camino feliz: refresca req.user con datos ACTUALES de la BD y llama next()", async () => {
      const req = {
        headers: { authorization: "Bearer tokValido" },
      };
      const res = makeRes();
      const next = jest.fn();
      verify.mockReturnValue({
        id: "u1",
        correo: "x@unistock.com",
        rolNombre: "RolViejoDelToken",
      });
      userRepoInstance.findById.mockResolvedValue({
        estado: true,
        rolId: "rolNuevo",
        rolNombre: "RolActualizado",
        sedeId: "sedeNueva",
      });

      await requireAuth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user.rolNombre).toBe("RolActualizado"); // no el del token viejo
      expect(req.user.correo).toBe("x@unistock.com"); // se conserva del token
    });
  });

  describe("requireRole", () => {
    test("rama: sin req.user -> 401", () => {
      const req = {};
      const res = makeRes();
      const next = jest.fn();

      requireRole("Gerente")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test("rama: rol del usuario no está en la lista permitida -> 403", () => {
      const req = { user: { rolNombre: "Empleado" } };
      const res = makeRes();
      const next = jest.fn();

      requireRole("Gerente", "Administrador")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });

    test("camino feliz: rol permitido (comparación insensible a mayúsculas) -> next()", () => {
      const req = { user: { rolNombre: "  GERENTE  " } };
      const res = makeRes();
      const next = jest.fn();

      requireRole("gerente")(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });

  describe("requirePermission", () => {
    test("rama: sin req.user -> 401", async () => {
      const req = {};
      const res = makeRes();
      const next = jest.fn();

      await requirePermission("compras", "leer")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
    });

    test("rama: rol no existe o está inactivo -> 403", async () => {
      const req = { user: { rolId: "rolX" } };
      const res = makeRes();
      const next = jest.fn();
      RoleModel.findById.mockReturnValue({ lean: () => Promise.resolve(null) });

      await requirePermission("compras", "leer")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("rama: rol no tiene el módulo asignado -> 403", async () => {
      const req = { user: { rolId: "rolX" } };
      const res = makeRes();
      const next = jest.fn();
      RoleModel.findById.mockReturnValue({
        lean: () =>
          Promise.resolve({
            estado: true,
            permisos: [{ modulo: "ventas", privilegios: ["leer"] }],
          }),
      });

      await requirePermission("compras", "leer")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("rama: tiene el módulo pero no el privilegio requerido -> 403", async () => {
      const req = { user: { rolId: "rolX" } };
      const res = makeRes();
      const next = jest.fn();
      RoleModel.findById.mockReturnValue({
        lean: () =>
          Promise.resolve({
            estado: true,
            permisos: [{ modulo: "compras", privilegios: ["leer"] }],
          }),
      });

      await requirePermission("compras", "eliminar")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    test("rama: error inesperado -> 500", async () => {
      const req = { user: { rolId: "rolX" } };
      const res = makeRes();
      const next = jest.fn();
      RoleModel.findById.mockImplementation(() => {
        throw new Error("Mongo caído");
      });
      jest.spyOn(console, "error").mockImplementation(() => {});

      await requirePermission("compras", "leer")(req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("camino feliz: rol tiene módulo y privilegio -> next()", async () => {
      const req = { user: { rolId: "rolX" } };
      const res = makeRes();
      const next = jest.fn();
      RoleModel.findById.mockReturnValue({
        lean: () =>
          Promise.resolve({
            estado: true,
            permisos: [{ modulo: "Compras", privilegios: ["Leer", "Crear"] }],
          }),
      });

      await requirePermission("compras", "leer")(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
  });
});
