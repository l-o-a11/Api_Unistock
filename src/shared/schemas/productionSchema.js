/**
 * productionSchema.js
 * Esquema de validación para producción usando Zod
 */
const z = require('zod');

// Estados válidos para órdenes de producción
const VALID_ESTADOS = ['Diseño', 'Ficha Técnica', 'Corte', 'Compras', 'Producción', 'Empaque', 'Enviado', 'Anulada'];

const createOrderSchema = z.object({
  cliente: z.string()
    .min(1, 'Cliente es requerido')
    .max(100, 'Cliente no puede exceder 100 caracteres'),
  
  
  fecha_entrega: z.any()
    .refine((raw) => raw !== undefined && raw !== null && raw !== '', {
      message: 'Fecha de entrega es requerida'
    })
    .transform((raw) => {
      // Aceptar: ISO 8601, YYYY-MM-DD, timestamp numérico, e incluso Date
      if (raw instanceof Date) return raw.toISOString();
      const s = typeof raw === 'number' ? String(raw) : String(raw);
      const d = new Date(s);
      if (isNaN(d.getTime())) {
        // mantener valor para que la refine final falle con mensaje
        return s;
      }
      return d.toISOString();
    })
    .refine(
      (d) => {
        const date = new Date(d);
        return date instanceof Date && !isNaN(date.getTime());
      },
      'Formato de fecha inválido (use YYYY-MM-DD o ISO 8601)'
    )
    .refine(
      (d) => {
        const date = new Date(d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      },
      'Fecha de entrega debe ser hoy o en el futuro'
    ),
  
  id_usuario: z.string().optional(),
  
  asignaciones: z.array(
    z.object({
      id_tercero: z.string(),
      cantidad: z.number().min(1, 'Cantidad debe ser mayor a 0'),
    })
  ).optional(),
});

const updateOrderSchema = z.object({
  cliente: z.string().min(3).max(100).optional(),
  fecha_entrega: z.any()
    .optional()
    .refine((raw) => raw === undefined || raw === null || raw === '' || !isNaN(new Date(raw).getTime()), {
      message: 'Formato de fecha inválido'
    })
    .transform((raw) => {
      if (raw === undefined || raw === null || raw === '') return raw;
      if (raw instanceof Date) return raw.toISOString();
      const s = typeof raw === 'number' ? String(raw) : String(raw);
      const d = new Date(s);
      return d.toISOString();
    }),
});

const cambiarEstadoSchema = z.object({
  estado: z.enum(VALID_ESTADOS, {
    errorMap: () => ({ message: `Estado debe ser uno de: ${VALID_ESTADOS.join(', ')}` })
  }),
});

const createOrderDetailSchema = z.object({
  id_orden: z.string(),
  id_producto: z.string(),
  cantidad: z.number().min(1, 'Cantidad debe ser mayor a 0'),
  color: z.string().optional().or(z.literal('')),
});

const anularOrderSchema = z.object({
  motivo: z.string()
    .min(5, 'Motivo debe tener al menos 5 caracteres')
    .max(200, 'Motivo no puede exceder 200 caracteres'),
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  cambiarEstadoSchema,
  createOrderDetailSchema,
  anularOrderSchema,
  VALID_ESTADOS,
};
