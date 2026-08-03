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
        await sendForgotPasswordEmail({ nombreCompleto: user.nombreCompleto, correo, codigo });

        // Enviar alerta de seguridad al mismo correo
        await sendAlertEmail({ nombreCompleto: user.nombreCompleto, correo });

        return { message: 'Se ha enviado un código de recuperación a tu correo' };
    }
}

module.exports = ForgotPassword;