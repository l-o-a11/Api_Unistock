// application/use-cases/auth/ChangePassword.js

const { compare, hash } = require('../../../infrastructure/security/password_encrypter');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[*\-_#~$])[A-Za-z\d*\-_#~$]{8,}$/;

class ChangePassword {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute({ userId, passwordActual, passwordNueva, confirmarPassword }) {

        // 1. Las contraseñas nuevas deben coincidir
        if (passwordNueva !== confirmarPassword) {
            const err = new Error('Las contraseñas no coinciden');
            err.statusCode = 400;
            throw err;
        }

        // 2. La contraseña nueva debe cumplir la política de seguridad
        if (!PASSWORD_REGEX.test(passwordNueva)) {
            const err = new Error(
                'La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 minúscula, ' +
                '1 número y 1 carácter especial (* - _ # ~ $)'
            );
            err.statusCode = 400;
            throw err;
        }

        // 3. Buscar el usuario incluyendo el hash de su contraseña actual.
        //    Se usa findByIdWithPassword() — el único método del repositorio que
        //    garantiza que el campo password está presente en la entidad.
        //    findById() no es suficiente porque _toEntity usa .toObject() que puede
        //    omitir el campo si el schema lo marca como select:false en el futuro.
        const user = await this.userRepository.findByIdWithPassword(userId);

        if (!user) {
            const err = new Error('Usuario no encontrado');
            err.statusCode = 404;
            throw err;
        }

        // 4. Verificar que la contraseña actual es correcta
        const match = await compare(passwordActual, user.password);
        if (!match) {
            const err = new Error('La contraseña actual es incorrecta');
            err.statusCode = 400;
            throw err;
        }

        // 5. Guardar el nuevo hash
        const hashedPassword = await hash(passwordNueva);
        await this.userRepository.update(userId, { password: hashedPassword });

        return { message: 'Contraseña actualizada correctamente' };
    }
}

module.exports = ChangePassword;