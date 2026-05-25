const mongoose = require('mongoose');

const passwordResetSchema = new mongoose.Schema({
    correo: { type: String, required: true },
    codigo: { type: String, required: true },
    resetToken: { type: String, default: null },
    intentos: { type: Number, default: 0 },
    expiraEn: { type: Date, required: true },
    usado: { type: Boolean, default: false },
});

module.exports = mongoose.model('PasswordReset', passwordResetSchema);