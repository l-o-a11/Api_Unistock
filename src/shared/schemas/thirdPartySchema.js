/**
 * thirdPartySchema.js
 * Esquema de validación para terceros usando Zod
 */
const z = require('zod');

const baseThirdParty = z.object({
  nit: z
    .union([z.string(), z.number()])
    .transform((v) => (v === null || v === undefined ? '' : String(v)))
    .refine((s) => s.trim().length >= 5, 'NIT debe tener al menos 5 caracteres')
    .refine((s) => s.trim().length <= 15, 'NIT no puede exceder 15 caracteres'),

  // Alias soportados por el frontend: nombre_empresa -> nombre, nombre_contacto -> contacto
  nombre: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres')
    .optional(),
  nombre_empresa: z
    .string()
    .min(3, 'Nombre debe tener al menos 3 caracteres')
    .max(100, 'Nombre no puede exceder 100 caracteres')
    .optional(),

  contacto: z
    .string()
    .min(3, 'Contacto debe tener al menos 3 caracteres')
    .max(100, 'Contacto no puede exceder 100 caracteres')
    .optional(),
  nombre_contacto: z
    .string()
    .min(3, 'Contacto debe tener al menos 3 caracteres')
    .max(100, 'Contacto no puede exceder 100 caracteres')
    .optional(),

  // Tolerar null/undefined del frontend
  direccion: z
    .union([z.string(), z.null()])
    .transform((v) => (v === null || v === undefined ? '' : v))
    .superRefine((s, ctx) => {
      // Si el frontend manda vacío, dejamos pasar (evita 400 por formatos del form)
      if (!s || !s.trim()) return;
      if (s.trim().length < 5) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['direccion'], message: 'Dirección debe tener al menos 5 caracteres' });
      }
      if (s.trim().length > 200) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['direccion'], message: 'Dirección no puede exceder 200 caracteres' });
      }
    }),

  // Aceptar telefono como string o number y normalizar a string
  telefono: z
    .union([z.string(), z.number(), z.null()])
    .transform((v) => {
      if (v === null || v === undefined) return '';
      return String(v);
    })
    .transform((s) => s.replace(/\s+/g, ''))
    .superRefine((s, ctx) => {
      // Si viene vacío, dejamos pasar
      if (!s || !s.trim()) return;

      const digits = s.replace(/\D/g, '');
      if (digits.length < 7 || digits.length > 15) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['telefono'],
          message: 'Teléfono inválido (debe tener entre 7 y 15 dígitos)',
        });
      }
    }),

  correo_empresa: z
    .union([z.string(), z.null()])
    .transform((v) => (v === null || v === undefined ? '' : v))
    .optional()
    .refine((v) => v === '' || z.string().email('Email inválido').safeParse(v).success, {
      message: 'Email inválido',
    }),

  correo_contacto: z
    .union([z.string(), z.null()])
    .transform((v) => (v === null || v === undefined ? '' : v))
    .optional()
    .refine((v) => v === '' || z.string().email('Email de contacto inválido').safeParse(v).success, {
      message: 'Email de contacto inválido',
    }),

  sitio_web: z
    .union([z.string(), z.null()])
    .transform((v) => (v === null || v === undefined ? '' : v))
    .optional()
    .refine((v) => v === '' || z.string().url('URL inválida').safeParse(v).success, {
      message: 'URL inválida',
    }),

  // Acepta boolean o string "true"/"false"
  estado: z
    .union([z.boolean(), z.literal('true'), z.literal('false')])
    .optional()
    .default(true)
    .transform((v) => (v === 'false' ? false : v === 'true' ? true : v)),
});

// Validación estricta para CREATE (requerir nombre/contacto vía alias)
const createThirdPartySchema = baseThirdParty.superRefine((data, ctx) => {
  const nombreFinal = data.nombre ?? data.nombre_empresa;
  const contactoFinal = data.contacto ?? data.nombre_contacto;

  if (!nombreFinal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['nombre'],
      message: 'Nombre es requerido (nombre o nombre_empresa)',
    });
  }

  if (!contactoFinal) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['contacto'],
      message: 'Contacto es requerido (contacto o nombre_contacto)',
    });
  }
});

// Validación para UPDATE: campos opcionales, y la regla de alias se aplica si
// el request trae alguno de esos campos.
const updateThirdPartySchema = baseThirdParty
  .partial()
  .superRefine((data, ctx) => {
    const nombreFinal = data.nombre ?? data.nombre_empresa;
    const contactoFinal = data.contacto ?? data.nombre_contacto;

    // Si viene alguno de los campos relacionados, exige que exista el par correspondiente.
    const hasNombreRelated =
      data.nombre !== undefined || data.nombre_empresa !== undefined;
    const hasContactoRelated =
      data.contacto !== undefined || data.nombre_contacto !== undefined;

    if (hasNombreRelated && !nombreFinal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nombre'],
        message: 'Nombre es requerido (nombre o nombre_empresa)',
      });
    }

    if (hasContactoRelated && !contactoFinal) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['contacto'],
        message: 'Contacto es requerido (contacto o nombre_contacto)',
      });
    }
  })
  .strict('No se permiten campos adicionales');

module.exports = {
  createThirdPartySchema,
  updateThirdPartySchema,
};

