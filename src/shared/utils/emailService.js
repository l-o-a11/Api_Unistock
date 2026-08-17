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

const sendEmailChangedEmail = async ({ nombreCompleto, correoNuevo, correoAnterior }) => {
  await transporter.sendMail({
    from: `"Equipo Unistock" <${process.env.EMAIL_USER}>`,
    to: correoNuevo,
    subject: 'Tu correo electrónico fue actualizado — Unistock',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Hola, ${nombreCompleto}</h2>
        <p>El correo electrónico asociado a tu cuenta en <strong>Unistock</strong> fue actualizado.</p>
        <table style="margin: 16px 0; border-collapse: collapse; width: 100%;">
          <tr>
            <td style="padding: 6px 12px; font-weight: bold; color: #555;">Correo anterior:</td>
            <td style="padding: 6px 12px; color: #333;">${correoAnterior}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 6px 12px; font-weight: bold; color: #555;">Correo nuevo:</td>
            <td style="padding: 6px 12px; color: #333;">${correoNuevo}</td>
          </tr>
        </table>
        <p>A partir de ahora debes usar <strong>${correoNuevo}</strong> para iniciar sesión.</p>
        <p>Si <strong>no realizaste este cambio</strong>, contacta al administrador del sistema inmediatamente.</p>
        <hr/>
        <p><strong>Equipo de Unistock</strong></p>
      </div>
    `,
  });
};

const sendProductionAssignedEmail = async ({ nombreCompleto, correo, numeroOrden, etapa }) => {
  await transporter.sendMail({
    from: `"Equipo Unistock" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: `Te asignaron la orden #${numeroOrden} — Unistock`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Hola, ${nombreCompleto}</h2>
        <p>Te asignaron la etapa <strong>${etapa}</strong> de la orden de producción <strong>#${numeroOrden}</strong>.</p>
        <p>Ingresa a Unistock para ver el detalle y avanzar cuando termines tu parte.</p>
        <p>
          <a href="${process.env.APP_URL || "http://localhost:5173/login"}">
            Ingresar a Unistock
          </a>
        </p>
        <hr/>
        <p><strong>Equipo de Unistock</strong></p>
      </div>
    `,
  });
};

const sendProductionStageCompletedEmail = async ({ nombreCompleto, correo, numeroOrden, etapaCompletada, empleadoNombre }) => {
  await transporter.sendMail({
    from: `"Equipo Unistock" <${process.env.EMAIL_USER}>`,
    to: correo,
    subject: `Orden #${numeroOrden} — etapa "${etapaCompletada}" finalizada`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Hola, ${nombreCompleto}</h2>
        <p><strong>${empleadoNombre}</strong> finalizó la etapa <strong>${etapaCompletada}</strong> de la orden de producción <strong>#${numeroOrden}</strong>.</p>
        <p>Ingresa a Unistock para asignar al siguiente responsable.</p>
        <p>
          <a href="${process.env.APP_URL || "http://localhost:5173/login"}">
            Ingresar a Unistock
          </a>
        </p>
        <hr/>
        <p><strong>Equipo de Unistock</strong></p>
      </div>
    `,
  });
};

const sendAccountLockedEmail = async ({ gerenteNombre, gerenteCorreo, usuarioBloqueado }) => {
  await transporter.sendMail({
    from: `"Equipo Unistock" <${process.env.EMAIL_USER}>`,
    to: gerenteCorreo,
    subject: `🔒 Cuenta bloqueada por intentos fallidos — ${usuarioBloqueado.nombreCompleto}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2>Hola, ${gerenteNombre}</h2>
        <p>La cuenta de <strong>${usuarioBloqueado.nombreCompleto}</strong> (${usuarioBloqueado.correo}) fue
        <strong>desactivada automáticamente</strong> tras 5 intentos fallidos de inicio de sesión consecutivos.</p>
        <p>Si el usuario confirma que fue él quien olvidó su contraseña, puedes reactivar la cuenta desde
        el módulo de Usuarios y sugerirle usar la opción "Olvidé mi contraseña".</p>
        <p>Si <strong>no reconoce</strong> estos intentos, podría tratarse de un intento de acceso no autorizado —
        te recomendamos dejar la cuenta desactivada y verificar con el usuario antes de reactivarla.</p>
        <p>
          <a href="${process.env.APP_URL || "http://localhost:5173/login"}">
            Ingresar a Unistock
          </a>
        </p>
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
  sendEmailChangedEmail,
  sendProductionAssignedEmail,
  sendProductionStageCompletedEmail,
  sendAccountLockedEmail,
};