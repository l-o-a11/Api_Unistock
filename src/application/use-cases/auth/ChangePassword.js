const { compare, hash } = require('../../../infrastructure/security/password_encrypter');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[*\-_#~$])[A-Za-z\d*\-_#~$]{8,}$/;

class ChangePassword {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ userId, passwordActual, passwordNueva, confirmarPassword }) {
        // Validar que passwords coincidan
        if (passwordNueva !== confirmarPassword) {
            const err = new Error('Las contraseñas no coinciden');
            err.statusCode = 400;
            throw err;
        }

        // Validar condiciones
        if (!PASSWORD_REGEX.test(passwordNueva)) {
            const err = new Error('La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial (* - _ # ~ $)');
            err.statusCode = 400;
            throw err;
        }

        // Buscar usuario con password (necesitamos el hash)
        const UserModel = require('../../../infrastructure/db/UserModel');
        const doc = await UserModel.findById(userId);

        if (!doc) {
            const err = new Error('Usuario no encontrado');
            err.statusCode = 404;
            throw err;
        }

        // Verificar contraseña actual
        const match = await compare(passwordActual, doc.password);
        if (!match) {
            const err = new Error('La contraseña actual es incorrecta');
            err.statusCode = 400;
            throw err;
        }

        // Actualizar contraseña
        const hashedPassword = await hash(passwordNueva);
        await this.userRepository.update(userId, { password: hashedPassword });

        return { message: 'Contraseña actualizada correctamente' };
    }
}

module.exports = ChangePassword;