const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendWelcomeEmail = async ({ nombreCompleto, correo, password }) => {
  const mailOptions = {
    from: `"Equipo Unistock" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: "Bienvenido a Unistock — Tu cuenta ha sido creada",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Hola, ${nombreCompleto}</h2>
        <p>Se ha creado una cuenta para ti en <strong>Unistock</strong>.</p>
        <table>
          <tr><td><strong>Correo:</strong></td><td>${correo}</td></tr>
          <tr><td><strong>Contraseña temporal:</strong></td><td>${password}</td></tr>
        </table>
        <p>Por seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión.</p>
        <p>Accede a la aplicación aquí: 
          <a href="${process.env.APP_URL || "http://localhost:5173/login"}">
            Ingresar a Unistock
          </a>
        </p>
        <hr/>
        <small>Si no reconoces esta cuenta, por favor informa al administrador.</small>
        <p>Bienvenido,<br/><strong>Equipo de Unistock</strong></p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail };