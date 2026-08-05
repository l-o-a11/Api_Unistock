// infrastructure/routes/authRoutes.js
// FIX #10: agregado POST /verify-password para que el frontend
//          valide la contraseña de admin en el servidor, no en el cliente.

const { Router } = require('express');
const ctrl = require('../controllers/userController');
const { requireAuth } = require('../../interfaces/middlewares/authMiddleware');
const { validate, rules } = require('../../interfaces/middlewares/validationMiddleware');

const router = Router();

// ── Públicas ──────────────────────────────────────────────────────────────────
router.post('/login', rules.login, validate, ctrl.login);
router.post('/prepare-welcome', ctrl.prepareWelcome);
router.post('/forgot-password', rules.forgotPassword, validate, ctrl.forgotPassword);
router.post('/verify-code', rules.verifyCode, validate, ctrl.verifyCode);
router.post('/reset-password', rules.resetPassword, validate, ctrl.resetPassword);

// ── Privadas — requieren estar autenticado ─────────────────────────────────────
router.put('/change-password', requireAuth, rules.changePassword, validate, ctrl.changePassword);
router.put('/profile', requireAuth, ctrl.updateProfile);

// FIX #10: verifica la contraseña del usuario autenticado sin cambiarla.
// El frontend la usa para confirmar acciones sensibles (eliminar/toggle sede, etc.)
router.post('/verify-password', requireAuth, ctrl.verifyPassword);

module.exports = router;
