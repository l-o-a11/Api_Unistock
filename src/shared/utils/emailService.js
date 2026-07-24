const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER?.trim(),
    pass: process.env.EMAIL_PASS?.trim(),
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

const sendForgotPasswordEmail = async ({ nombreCompleto, correo, codigo }) => {
  await transporter.sendMail({
    from: `"Equipo Unistock" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: 'Código de recuperación de contraseña — Unistock',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Hola, ${nombreCompleto}</h2>
        <p>Recibimos una solicitud para recuperar tu contraseña.</p>
        <p>Tu código de verificación es:</p>
        <h1 style="letter-spacing: 8px; color: #333;">${codigo}</h1>
        <p>Este código expira en <strong>10 minutos</strong>.</p>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
        <hr/>
        <p><strong>Equipo de Unistock</strong></p>
      </div>
    `,
  });
};

const sendAlertEmail = async ({ nombreCompleto, correo }) => {
  await transporter.sendMail({
    from: `"Equipo Unistock" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: '⚠️ Alerta de seguridad — Unistock',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Hola, ${nombreCompleto}</h2>
        <p>Alguien solicitó recuperar la contraseña de tu cuenta.</p>
        <p>Si fuiste tú, ignora este mensaje.</p>
        <p>Si <strong>no fuiste tú</strong>, te recomendamos:</p>
        <ul>
          <li>No compartir el código que llegó a tu correo</li>
          <li>Informar al administrador del sistema</li>
        </ul>
        <hr/>
        <p><strong>Equipo de Unistock</strong></p>
      </div>
    `,
  });
};

const sendPasswordChangedEmail = async ({ nombreCompleto, correo }) => {
  await transporter.sendMail({
    from: `"Equipo Unistock" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: 'Tu contraseña fue actualizada — Unistock',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Hola, ${nombreCompleto}</h2>
        <p>Tu contraseña fue actualizada correctamente.</p>
        <p>Si no realizaste este cambio, contacta al administrador inmediatamente.</p>
        <hr/>
        <p><strong>Equipo de Unistock</strong></p>
      </div>
    `,
  });
};

module.exports = {
  sendWelcomeEmail,
  sendForgotPasswordEmail,
  sendAlertEmail,
  sendPasswordChangedEmail,
};