const crypto = require('crypto');
const PasswordResetModel = require('../../../infrastructure/db/PasswordResetModel');

const MAX_INTENTOS = 3;

class VerifyCode {
    constructor() { }

    async execute({ correo, codigo }) {
        const registro = await PasswordResetModel.findOne({
            correo,
            usado: false,
        });

        if (!registro) {
            const err = new Error('No hay una solicitud de recuperación activa para este correo');
            err.statusCode = 400;
            throw err;
        }

        // Verificar expiración
        if (new Date() > registro.expiraEn) {
            await PasswordResetModel.deleteOne({ _id: registro._id });
            const err = new Error('El código ha expirado, solicita uno nuevo');
            err.statusCode = 400;
            throw err;
        }

        // Verificar intentos
        if (registro.intentos >= MAX_INTENTOS) {
            await PasswordResetModel.deleteOne({ _id: registro._id });
            const err = new Error('Demasiados intentos fallidos, solicita un nuevo código');
            err.statusCode = 400;
            throw err;
        }

        // Verificar código
        if (registro.codigo !== codigo) {
            await PasswordResetModel.updateOne(
                { _id: registro._id },
                { $inc: { intentos: 1 } }
            );
            const intentosRestantes = MAX_INTENTOS - (registro.intentos + 1);
            const err = new Error(`Código incorrecto. Te quedan ${intentosRestantes} intentos`);
            err.statusCode = 400;
            throw err;
        }

        // Código correcto — generar resetToken de un solo uso
        const resetToken = crypto.randomBytes(32).toString('hex');

        await PasswordResetModel.updateOne(
            { _id: registro._id },
            { resetToken, usado: false }
        );

        return { resetToken };
    }
}

module.exports = VerifyCode;