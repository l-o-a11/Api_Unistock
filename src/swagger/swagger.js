/**
 * swagger.js
 * Configuración de Swagger/OpenAPI para documentación de API
 */
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Unistock',
      version: '1.0.0',
      description: 'API para gestión de producción, terceros, proveedores y artículos',
      contact: {
        name: 'Soporte',
        email: 'support@unistock.local'
      },
      license: {
        name: 'ISC'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor local (desarrollo)'
      },
      {
        url: 'https://api.unistock.local/api',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        ThirdParty: {
          type: 'object',
          required: ['nit', 'nombre', 'contacto', 'direccion', 'telefono'],
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            nit: { type: 'string', example: '123456789' },
            nombre: { type: 'string', example: 'Empresa XYZ' },
            contacto: { type: 'string', example: 'Juan Pérez' },
            direccion: { type: 'string', example: 'Calle 10 # 15-30' },
            telefono: { type: 'string', example: '+57 315-8765432' },
            correo_empresa: { type: 'string', example: 'info@empresa.com' },
            correo_contacto: { type: 'string', example: 'juan@empresa.com' },
            sitio_web: { type: 'string', example: 'https://empresa.com' },
            estado: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        ProductionOrder: {
          type: 'object',
          required: ['cliente', 'fecha_entrega'],
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            numero_orden: { type: 'string', example: 'ORD-001' },
            cliente: { type: 'string', example: 'Cliente ABC' },
            fecha_entrega: { type: 'string', format: 'date-time', example: '2024-06-30T15:00:00Z' },
            estado: { type: 'string', enum: ['Diseño', 'Ficha Técnica', 'Corte', 'Compras', 'Producción', 'Empaque', 'Enviado', 'Anulada'] },
            detalles: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id_producto: { type: 'string' },
                  cantidad: { type: 'number' },
                  color: { type: 'string' }
                }
              }
            },
            asignaciones: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id_tercero: { type: 'string' },
                  cantidad: { type: 'number' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error en la operación' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: [
    './src/infrastructure/routes/thirdPartiesRoute.js',
    './src/infrastructure/routes/productionRoutes.js',
    './src/infrastructure/routes/productRoutes.js',
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi
};
