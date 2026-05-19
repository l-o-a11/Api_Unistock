const { Router } = require('express');
const ctrl = require('../controllers/userController');
const { requireAuth } = require('../../interfaces/middlewares/authMiddleware');
const { validate, rules } = require('../../interfaces/middlewares/validationMiddleware');

const router = Router();

// Públicas
router.post('/login', rules.login, validate, ctrl.login);
router.post('/prepare-welcome', ctrl.prepareWelcome);
router.post('/forgot-password', rules.forgotPassword, validate, ctrl.forgotPassword);
router.post('/verify-code', rules.verifyCode, validate, ctrl.verifyCode);
router.post('/reset-password', rules.resetPassword, validate, ctrl.resetPassword);

// Privada — requiere estar autenticado
router.put('/change-password', requireAuth, rules.changePassword, validate, ctrl.changePassword);

module.exports = router;