/**
 * thirdPartiesRoute.js
 * 
 * Define las rutas para la gestión de Terceros.
 * 
 * Endpoints:
 * - GET    /terceros          - Listar terceros
 * - GET    /terceros/:id      - Obtener tercero
 * - POST   /terceros          - Crear tercero
 * - PUT    /terceros/:id      - Actualizar tercero
 * - DELETE /terceros/:id      - Eliminar tercero
 * 
 * @author Unistock Team
 */

const { Router } = require("express");
const ctrl = require("../controllers/thirdPartiesController");
const { requireAuth } = require("../../interfaces/middlewares/authMiddleware");
const validateSchema = require("../middlewares/validateSchema");
const { createThirdPartySchema, updateThirdPartySchema } = require("../../shared/schemas/thirdPartySchema");

// Asignación de producciones a terceros (frontend usa POST /terceros/:id/producciones)


const router = Router();

router.use(requireAuth);

/**
 * @swagger
 * /terceros:
 *   get:
 *     summary: Listar todos los terceros
 *     tags: [Terceros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de terceros recuperada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ThirdParty'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 *   post:
 *     summary: Crear un nuevo tercero
 *     tags: [Terceros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nit, nombre, contacto, direccion, telefono]
 *             properties:
 *               nit:
 *                 type: string
 *                 example: "123456789"
 *               nombre:
 *                 type: string
 *                 example: "Empresa XYZ S.A."
 *               contacto:
 *                 type: string
 *                 example: "Juan Pérez González"
 *               direccion:
 *                 type: string
 *                 example: "Calle 10 # 15-30, Bogotá"
 *               telefono:
 *                 type: string
 *                 example: "+57 315-8765432"
 *               correo_empresa:
 *                 type: string
 *                 example: "info@empresa.com"
 *               correo_contacto:
 *                 type: string
 *                 example: "juan@empresa.com"
 *               sitio_web:
 *                 type: string
 *                 example: "https://empresa.com"
 *     responses:
 *       201:
 *         description: Tercero creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: "Tercero creado" }
 *                 data: { $ref: '#/components/schemas/ThirdParty' }
 *       400:
 *         description: Error de validación
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No autorizado
 */
router.get("/", ctrl.getThirdParties);
router.get("/:id", ctrl.getThirdPartyById);
router.post("/", validateSchema(createThirdPartySchema), ctrl.createThirdParty);
router.put("/:id", validateSchema(updateThirdPartySchema), ctrl.updateThirdParty);
router.delete("/:id", ctrl.deleteThirdParty);

// Toggle estado (activar/inactivar)
// El frontend llama PATCH /api/terceros/:id/toggle
router.patch("/:id/toggle", ctrl.toggleThirdParty);

// Vincular producciones a un tercero
// FRONT: thirdPartyAPI.linkProduccion(id, { orden, fecha, produccionId, cantidad })
router.post("/:id/producciones", ctrl.linkProduccionToTercero);


/**
 * @swagger
 * /terceros/{id}:

 *   get:
 *     summary: Obtener un tercero por ID
 *     tags: [Terceros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del tercero
 *     responses:
 *       200:
 *         description: Tercero encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/ThirdParty' }
 *       404:
 *         description: Tercero no encontrado
 *       401:
 *         description: No autorizado
 *   put:
 *     summary: Actualizar un tercero
 *     tags: [Terceros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nit: { type: string }
 *               nombre: { type: string }
 *               contacto: { type: string }
 *               direccion: { type: string }
 *               telefono: { type: string }
 *               correo_empresa: { type: string }
 *               correo_contacto: { type: string }
 *               sitio_web: { type: string }
 *     responses:
 *       200:
 *         description: Tercero actualizado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/ThirdParty' }
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Tercero no encontrado
 *       401:
 *         description: No autorizado
 *   delete:
 *     summary: Eliminar un tercero
 *     tags: [Terceros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Tercero eliminado
 *       404:
 *         description: Tercero no encontrado
 *       401:
 *         description: No autorizado
 */

module.exports = router;
