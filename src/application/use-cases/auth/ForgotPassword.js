const crypto = require('crypto');
const PasswordResetModel = require('../../../infrastructure/db/PasswordResetModel');
const { sendForgotPasswordEmail, sendAlertEmail } = require('../../../shared/utils/emailService');

class ForgotPassword {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ correo }) {
        const user = await this.userRepository.findByEmail(correo);

        if (!user) {
            const error = new Error('No existe un usuario registrado con ese correo');
            error.statusCode = 404;
            throw error;
        }

        if (!user.estado) {
            const error = new Error('El usuario no está activo');
            error.statusCode = 403;
            throw error;
        }

        // Invalidar códigos anteriores del mismo correo
        await PasswordResetModel.deleteMany({ correo });

        // Generar código de 6 dígitos criptográficamente seguro
        const codigo = crypto.randomInt(100000, 999999).toString();

        // Guardar en BD con expiración de 10 minutos
        await PasswordResetModel.create({
            correo,
            codigo,
            expiraEn: new Date(Date.now() + 10 * 60 * 1000),
        });

        // Enviar código al usuario
        try {
            await sendForgotPasswordEmail({ nombreCompleto: user.nombreCompleto, correo, codigo });
        } catch (emailErr) {
            console.error("ERROR ENVIANDO CORREO DE RECUPERACION:", emailErr);
            const error = new Error('No se pudo enviar el correo de recuperación. Intenta nuevamente.');
            error.statusCode = 500;
            throw error;
        }

        // Enviar alerta de seguridad al mismo correo (no bloquea el flujo)
        try {
            await sendAlertEmail({ nombreCompleto: user.nombreCompleto, correo });
        } catch (alertErr) {
            console.error("ERROR ENVIANDO ALERTA DE SEGURIDAD:", alertErr);
        }

        return { message: 'Se ha enviado un código de recuperación a tu correo' };
    }
}

module.exports = ForgotPassword;