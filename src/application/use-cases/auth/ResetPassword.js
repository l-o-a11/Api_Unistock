const PasswordResetModel = require('../../../infrastructure/db/PasswordResetModel');
const { hash } = require('../../../infrastructure/security/password_encrypter');
const { sendPasswordChangedEmail } = require('../../../shared/utils/emailService');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[*\-_#~$])[A-Za-z\d*\-_#~$]{8,}$/;

class ResetPassword {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ resetToken, password, confirmarPassword }) {
        // Validar que passwords coincidan
        if (password !== confirmarPassword) {
            const err = new Error('Las contraseñas no coinciden');
            err.statusCode = 400;
            throw err;
        }

        // Validar condiciones de contraseña
        if (!PASSWORD_REGEX.test(password)) {
            const err = new Error('La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (* - _ # ~ $)');
            err.statusCode = 400;
            throw err;
        }

        // Buscar el resetToken
        const registro = await PasswordResetModel.findOne({ resetToken, usado: false });

        if (!registro) {
            const err = new Error('Token inválido o ya utilizado');
            err.statusCode = 400;
            throw err;
        }

        // Verificar expiración
        if (new Date() > registro.expiraEn) {
            await PasswordResetModel.deleteOne({ _id: registro._id });
            const err = new Error('El token ha expirado, solicita un nuevo código');
            err.statusCode = 400;
            throw err;
        }

        // Actualizar contraseña
        const hashedPassword = await hash(password);
        const user = await this.userRepository.findByEmail(registro.correo);
        await this.userRepository.update(user.id, { password: hashedPassword });

        // Invalidar el token — eliminar el registro
        await PasswordResetModel.deleteOne({ _id: registro._id });

        // Correo de confirmación
        await sendPasswordChangedEmail({
            nombreCompleto: user.nombreCompleto,
            correo: registro.correo,
        });

        return { message: 'Contraseña actualizada correctamente' };
    }
}

module.exports = ResetPassword;