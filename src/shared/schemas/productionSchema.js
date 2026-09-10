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
    const cleaned = { ...raw };

    for (const key of ['id_usuario', 'tipo', 'referencia', 'producto', 'asignaciones', 'designImages', 'finishedImages', 'finishedImageUrl', 'fromDamaged', 'originalOrderNumber', 'originalOrderStatus', 'techSpecification', 'empleadoAsignaciones', 'sedeAsignaciones', 'terceroAsignaciones', 'sedeId', 'id_tercero']) {
      if (cleaned[key] === '' || cleaned[key] === null) cleaned[key] = undefined;
    }

    if (typeof cleaned.fecha_entrega === 'string') cleaned.fecha_entrega = cleaned.fecha_entrega.trim();
    if (typeof cleaned.cliente === 'string') cleaned.cliente = cleaned.cliente.trim();

    const asignaciones = cleaned.asignaciones || cleaned.terceros;
    if (Array.isArray(asignaciones)) {
      cleaned.asignaciones = asignaciones.map((asig) => {
        if (!asig || typeof asig !== 'object') return asig;
        const normalized = { ...asig };
        if (!normalized.id_tercero && normalized.tercero) {
          normalized.id_tercero = normalized.tercero;
        }
        if (typeof normalized.cantidad === 'string') {
          normalized.cantidad = Number(normalized.cantidad);
        }
        return normalized;
      });
    }

    const clientValue = cleaned.cliente ?? cleaned.client ?? cleaned.nombre ?? cleaned.customer;
    const fechaEntregaValue = cleaned.fecha_entrega ?? cleaned.deliveryDate ?? cleaned.fechaSolicitud;
    const usuarioValue = cleaned.id_usuario ?? cleaned.userId ?? cleaned.user_id;

    const normalized = { ...cleaned };
    if (clientValue !== undefined && clientValue !== null && String(clientValue).trim() !== '') {
      normalized.cliente = String(clientValue).trim();
    } else {
      delete normalized.cliente;
      delete normalized.client;
      delete normalized.nombre;
      delete normalized.customer;
    }

    if (fechaEntregaValue !== undefined && fechaEntregaValue !== null && String(fechaEntregaValue).trim() !== '') {
      normalized.fecha_entrega = fechaEntregaValue;
    } else {
      delete normalized.fecha_entrega;
      delete normalized.deliveryDate;
      delete normalized.fechaSolicitud;
    }

    if (usuarioValue !== undefined && usuarioValue !== null && String(usuarioValue).trim() !== '') {
      normalized.id_usuario = usuarioValue;
    } else {
      delete normalized.id_usuario;
      delete normalized.userId;
      delete normalized.user_id;
    }

    normalized.asignaciones = cleaned.asignaciones ?? cleaned.terceros;

    return normalized;
  }
  return raw;
};

// Estados válidos para órdenes de producción
// ✅ Fix: "Empaque" renombrado a "Recepción"
const VALID_ESTADOS = ['Diseño', 'Ficha Técnica', 'Corte', 'Compras', 'Producción', 'Recepción', 'Enviado', 'Anulada'];

const createOrderSchema = z.preprocess(normalizeProductionPayload, z.object({
  cliente: z.union([z.string(), z.number()])
    .transform((val) => String(val).trim())
    .superRefine((val, ctx) => {
      if (!val || val.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cliente'],
          message: 'Cliente es requerido',
        });
      }
      if (val && val.length > 100) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          path: ['cliente'],
          message: 'Cliente no puede exceder 100 caracteres',
        });
      }
    }),
  
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
  
  designImages: z.array(z.any()).optional(),
  finishedImages: z.array(z.any()).optional(),
  finishedImageUrl: z.any().optional(),
  
  asignaciones: z.array(
    z.object({
      id_tercero: z.union([z.string(), z.number()])
        .transform((val) => String(val))
        .superRefine((val, ctx) => {
          if (!val || val.trim().length === 0) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ctx.path,
              message: 'id_tercero es requerido',
            });
          }
        }),
      cantidad: z.union([z.number(), z.string()])
        .transform((val) => Number(val))
        .superRefine((val, ctx) => {
          if (Number.isNaN(val) || val < 1) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ctx.path,
              message: 'Cantidad debe ser mayor a 0',
            });
          }
        }),
    })
  ).optional(),
  
  tipo: z.string().optional(),
  referencia: z.string().optional(),
  producto: z.string().optional(),
  fromDamaged: z.boolean().optional(),
  originalOrderNumber: z.string().optional(),
  originalOrderStatus: z.string().optional(),
}).catchall(z.any()));

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
  designImages: z.array(z.any()).optional(),
  finishedImages: z.array(z.any()).optional(),
  finishedImageUrl: z.any().optional(),
  techSpecification: z.any().optional(),
  tipo: z.string().optional(),
  referencia: z.string().optional(),
  producto: z.string().optional(),
  id_usuario: z.string().optional(),
  asignaciones: z.array(z.any()).optional(),
  empleadoAsignaciones: z.any().optional(),
  sedeAsignaciones: z.array(z.any()).optional(),
  terceroAsignaciones: z.array(z.any()).optional(),
  sedeId: z.string().optional(),
  fromDamaged: z.boolean().optional(),
  originalOrderNumber: z.string().optional(),
  originalOrderStatus: z.string().optional(),
}).catchall(z.any()));

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

const reasignarEmpleadoSchema = z.object({
  id_empleado: z.string()
    .min(1, 'id_empleado es requerido'),
  motivo: z.string()
    .min(5, 'Justificación debe tener al menos 5 caracteres')
    .max(300, 'Justificación no puede exceder 300 caracteres'),
});

module.exports = {
  createOrderSchema,
  updateOrderSchema,
  cambiarEstadoSchema,
  createOrderDetailSchema,
  anularOrderSchema,
  reasignarEmpleadoSchema,
  VALID_ESTADOS,
};
