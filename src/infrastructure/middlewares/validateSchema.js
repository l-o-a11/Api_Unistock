/**
 * validateSchema.js
 * Middleware para validar requests usando esquemas Zod
 */

const { ZodError } = require('zod');

const validateSchema = (schema) => {
  return async (req, res, next) => {
    try {
      const validated = await schema.parseAsync(req.body);
      req.validatedData = validated;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const formattedErrors = err.issues.map(e => ({
          field: e.path.join('.') || 'root',
          message: e.message,
          code: e.code
        }));

        console.log('[validateSchema] req.body recibido:', req.body);
        console.log('[validateSchema] Errores de validación:', formattedErrors);

        const message = formattedErrors.length > 0 ? formattedErrors[0].message : 'Error de validación en los datos enviados';

        return res.status(400).json({
          success: false,
          message,
          errors: formattedErrors,
          received: req.body,
        });
      }

      console.error('[validateSchema] Error inesperado:', err.message || err);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

module.exports = validateSchema;