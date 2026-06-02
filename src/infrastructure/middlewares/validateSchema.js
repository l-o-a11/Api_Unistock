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
      // Si es un error de Zod, formatea los errores
      if (err instanceof ZodError) {
        const formattedErrors = err.issues.map(e => ({
          field: e.path.join('.') || 'root',
          message: e.message,
          code: e.code
        }));
        
        console.log('[validateSchema] req.body recibido:', req.body);
        console.log('[validateSchema] Errores de validación:', formattedErrors);

        return res.status(400).json({
          success: false,
          message: 'Error de validación en los datos enviados',
          errors: formattedErrors,
          received: req.body,
        });
      }
      
      // Si es otro tipo de error, retorna error genérico
      console.error('[validateSchema] Error inesperado:', err.message || err);
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  };
};

module.exports = validateSchema;
