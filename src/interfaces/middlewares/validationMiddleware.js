const { body, param, query, validationResult } = require("express-validator");
const { badRequest } = require("../../shared/utils/response");

const optionalPhone = (field) =>
  body(field)
    .optional({ values: "null" })
    .isString().withMessage("Debe ser texto")
    .matches(/^\d{10,12}$/).withMessage("Debe tener entre 10 y 12 dígitos");

const optionalText = (field, max = 100) =>
  body(field)
    .optional({ values: "null" })
    .isString().withMessage("Debe ser texto")
    .isLength({ max }).withMessage(`No puede exceder ${max} caracteres`)
    .trim();

const optionalId = (field) =>
  body(field)
    .optional({ values: "null" })
    .isMongoId().withMessage(`${field} inválido`);

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequest(
      res,
      "Datos inválidos",
      errors.array().map((e) => ({ field: e.path, message: e.msg })),
    );
  }
  next();
};

const rules = {
  createUser: [
    body("tipoDocumento").isIn(["CC", "TI", "CE", "PEP", "PAS", "PPT"]).withMessage("Tipo de documento inválido"),
    body("numeroDocumento")
      .notEmpty().withMessage("Obligatorio")
      .isNumeric().withMessage("Solo números")
      .isLength({ min: 6, max: 20 }).withMessage("Entre 6 y 20 dígitos"),
    body("nombreCompleto")
      .notEmpty().withMessage("Obligatorio")
      .isLength({ min: 3, max: 100 }).withMessage("Entre 3 y 100 caracteres")
      .trim(),
    optionalPhone("telefono"),
    body("correo").isEmail().withMessage("Correo inválido").normalizeEmail({ gmail_remove_dots: false }),
    body("rolId")
      .notEmpty().withMessage("Rol requerido")
      .isMongoId().withMessage("rolId inválido"),
    body("sedeId")
      .notEmpty().withMessage("Sede requerida")
      .isMongoId().withMessage("sedeId inválido"),
    body("cargo")
      .optional()
      .isArray({ max: 5 }).withMessage("cargo debe ser una lista de máximo 5 cargos"),
    body("cargo.*")
      .optional()
      .isString().withMessage("Cada cargo debe ser texto")
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage("Cada cargo debe tener entre 2 y 100 caracteres"),
    body("password")
      .optional()
      .isLength({ min: 6 }).withMessage("Mínimo 6 caracteres"),
  ],

  updateUser: [
    param("id").isMongoId().withMessage("ID inválido"),
    body("tipoDocumento").optional().isIn(["CC", "TI", "CE", "PEP", "PAS", "PPT"]),
    body("numeroDocumento")
      .optional()
      .isNumeric()
      .isLength({ min: 6, max: 20 }),
    body("nombreCompleto")
      .optional()
      .isLength({ min: 3, max: 100 }).trim(),
    optionalPhone("telefono"),
    body("correo").optional().isEmail().normalizeEmail({ gmail_remove_dots: false }),
    body("rolId").optional().isMongoId().withMessage("rolId inválido"),
    body("sedeId").optional().isMongoId().withMessage("sedeId inválido"),
    body("cargo")
      .optional()
      .isArray({ max: 5 }).withMessage("cargo debe ser una lista de máximo 5 cargos"),
    body("cargo.*")
      .optional()
      .isString().withMessage("Cada cargo debe ser texto")
      .trim()
      .isLength({ min: 2, max: 100 }).withMessage("Cada cargo debe tener entre 2 y 100 caracteres"),
  ],

  idParam: [
    param("id").isMongoId().withMessage("ID inválido"),
  ],

  listUsers: [
    query("rolId").optional().isMongoId(),
    query("sedeId").optional().isMongoId(),
    query("estado").optional().isIn(["true", "false"]),
    query("excludeRoleNames").optional().isString(),
  ],

  login: [
    body("correo").isEmail().withMessage("Correo inválido").normalizeEmail({ gmail_remove_dots: false }),
    body("password").notEmpty().withMessage("Contraseña requerida"),
  ],

  forgotPassword: [
    body('correo').isEmail().withMessage('Correo inválido').normalizeEmail({ gmail_remove_dots: false }),
  ],

  verifyCode: [
    body('correo').isEmail().withMessage('Correo inválido').normalizeEmail({ gmail_remove_dots: false }),
    body('codigo')
      .notEmpty().withMessage('Código requerido')
      .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos')
      .isNumeric().withMessage('El código solo debe contener números'),
  ],

  resetPassword: [
    body('resetToken').notEmpty().withMessage('Token requerido'),
    body('password').notEmpty().withMessage('Contraseña requerida'),
    body('confirmarPassword').notEmpty().withMessage('Confirmar contraseña requerida'),
  ],

  changePassword: [
    body('passwordActual').notEmpty().withMessage('Contraseña actual requerida'),
    body('passwordNueva').notEmpty().withMessage('Nueva contraseña requerida'),
    body('confirmarPassword').notEmpty().withMessage('Confirmar contraseña requerida'),
  ],

  createPurchase: [
    body("fecha").notEmpty().withMessage("Fecha requerida").isISO8601().withMessage("Fecha inválida"),
    body("proveedorId").notEmpty().withMessage("Proveedor requerido").isMongoId().withMessage("proveedorId inválido"),
    body("total").notEmpty().withMessage("Total requerido").isFloat({ min: 0 }).withMessage("Total inválido"),
    body("numeroFactura").notEmpty().withMessage("Número de factura requerido").isString().isLength({ max: 100 }).withMessage("No puede exceder 100 caracteres").trim(),
    optionalText("observaciones", 1000),
    body("detalles").optional().isArray().withMessage("detalles debe ser una lista"),
    body("detalles.*.productoId").optional({ values: "null" }).isMongoId().withMessage("productoId inválido"),
    body("detalles.*.insumoId").optional({ values: "null" }).isMongoId().withMessage("insumoId inválido"),
    body("detalles.*.nombre").optional({ values: "null" }).isString().isLength({ max: 100 }).withMessage("El nombre no puede exceder 100 caracteres").trim(),
    body("detalles.*.medida").optional({ values: "null" }).isString().isLength({ max: 100 }).withMessage("La medida no puede exceder 100 caracteres").trim(),
  ],

  updatePurchase: [
    param("id").isMongoId().withMessage("ID inválido"),
    body("fecha").optional().isISO8601().withMessage("Fecha inválida"),
    optionalId("proveedorId"),
    body("total").optional().isFloat({ min: 0 }).withMessage("Total inválido"),
    body("numeroFactura").optional().isString().isLength({ max: 100 }).withMessage("No puede exceder 100 caracteres").trim(),
    optionalText("observaciones", 1000),
  ],

  createPurchaseDetail: [
    body("compraId").optional().isMongoId().withMessage("compraId inválido"),
    body("purchaseId").optional().isMongoId().withMessage("purchaseId inválido"),
    optionalId("productoId"),
    optionalId("insumoId"),
    optionalText("nombre", 100),
    optionalText("medida", 100),
    body("cantidad").notEmpty().withMessage("Cantidad requerida").isFloat({ min: 0 }).withMessage("Cantidad inválida"),
    body("precioUnitario").notEmpty().withMessage("Precio unitario requerido").isFloat({ min: 0 }).withMessage("Precio unitario inválido"),
    body("subtotal").optional().isFloat({ min: 0 }).withMessage("Subtotal inválido"),
  ],

  cancelPurchase: [
    param("id").isMongoId().withMessage("ID inválido"),
    body("motivo").notEmpty().withMessage("El motivo de anulación es requerido").isString().isLength({ max: 1000 }).withMessage("No puede exceder 1000 caracteres").trim(),
  ],
};

module.exports = { validate, rules };
