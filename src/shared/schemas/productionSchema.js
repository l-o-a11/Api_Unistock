/**
 * productionSchema.js
 * Esquema de validación para producción usando Zod
 */
const z = require('zod');

const parseFlexibleDate = (raw) => {
  if (raw instanceof Date) return raw;
  if (typeof raw === 'number' && !Number.isNaN(raw)) return new Date(raw);
  if (typeof raw !== 'string') return raw;

  const value = raw.trim();

  if (/^\d{4}-\d{2}-\d{2}(T.*)?$/.test(value)) {
    return new Date(value);
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
    const [day, month, year] = value.split('/');
    return new Date(`${year}-${month}-${day}`);
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(value)) {
    const [day, month, year] = value.split('-');
    return new Date(`${year}-${month}-${day}`);
  }

  return new Date(value);
};

const normalizeDateValue = (raw) => {
  const parsed = parseFlexibleDate(raw);
  if (parsed instanceof Date && !Number.isNaN(parsed.getTime())) return parsed.toISOString();
  return raw;
};

const normalizeProductionPayload = (raw) => {
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return {
      ...raw,
      cliente: raw.cliente ?? raw.client ?? raw.nombre ?? raw.customer,
      fecha_entrega: raw.fecha_entrega ?? raw.deliveryDate ?? raw.fechaSolicitud,
      id_usuario: raw.id_usuario ?? raw.userId ?? raw.user_id,
      asignaciones: raw.asignaciones ?? raw.terceros,
    };
  }
  return raw;
};

// Estados válidos para órdenes de producción
const VALID_ESTADOS = ['Diseño', 'Ficha Técnica', 'Corte', 'Compras', 'Producción', 'Empaque', 'Enviado', 'Anulada'];

const createOrderSchema = z.preprocess(normalizeProductionPayload, z.object({
  cliente: z.string()
    .min(1, 'Cliente es requerido')
    .max(100, 'Cliente no puede exceder 100 caracteres'),
  
  fecha_entrega: z.any()
    .refine((raw) => raw !== undefined && raw !== null && raw !== '', {
      message: 'Fecha de entrega es requerida'
    })
    .transform((raw) => normalizeDateValue(raw))
    .refine(
      (d) => {
        const date = new Date(d);
        return date instanceof Date && !isNaN(date.getTime());
      },
      'Formato de fecha inválido (use YYYY-MM-DD, DD/MM/YYYY o ISO 8601)'
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
}));

const updateOrderSchema = z.preprocess(normalizeProductionPayload, z.object({
  cliente: z.string().min(3).max(100).optional(),
  fecha_entrega: z.any()
    .optional()
    .refine((raw) => raw === undefined || raw === null || raw === '' || !isNaN(parseFlexibleDate(raw).getTime()), {
      message: 'Formato de fecha inválido'
    })
    .transform((raw) => {
      if (raw === undefined || raw === null || raw === '') return raw;
      return normalizeDateValue(raw);
    }),
}));

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
