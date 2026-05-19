const crypto = require('crypto');
const PasswordResetModel = require('../../../infrastructure/db/PasswordResetModel');
const { sendForgotPasswordEmail, sendAlertEmail } = require('../../../shared/utils/emailService');

class ForgotPassword {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ correo }) {
        // Siempre responde igual — evita enumeración de usuarios
        const respuesta = { message: 'Si el correo existe, recibirás un código en los próximos minutos' };

        const user = await this.userRepository.findByEmail(correo);
        if (!user || !user.estado) return respuesta;

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

        return respuesta;
    }
}

module.exports = ForgotPassword;