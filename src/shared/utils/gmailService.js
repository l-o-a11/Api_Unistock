const { google } = require("googleapis");

// Cliente OAuth2 dedicado exclusivamente al envío de correos (Gmail API).
// Usa un refresh token guardado en variables de entorno, por lo que no
// depende de ningún archivo en disco (importante en Render, donde el
// sistema de archivos es efímero y se borra en cada redeploy/restart).
let gmailOAuthClient = null;

function getGmailAuthClient() {
    if (gmailOAuthClient) return gmailOAuthClient;

    const {
        GOOGLE_GMAIL_CLIENT_ID,
        GOOGLE_GMAIL_CLIENT_SECRET,
        GOOGLE_GMAIL_REDIRECT_URI,
        GOOGLE_GMAIL_REFRESH_TOKEN,
    } = process.env;

    if (!GOOGLE_GMAIL_CLIENT_ID || !GOOGLE_GMAIL_CLIENT_SECRET || !GOOGLE_GMAIL_REFRESH_TOKEN) {
        throw new Error(
            "Faltan variables de entorno para el envío de correos. " +
            "Verifica que GOOGLE_GMAIL_CLIENT_ID, GOOGLE_GMAIL_CLIENT_SECRET y " +
            "GOOGLE_GMAIL_REFRESH_TOKEN estén configuradas en Render."
        );
    }

    gmailOAuthClient = new google.auth.OAuth2(
        GOOGLE_GMAIL_CLIENT_ID,
        GOOGLE_GMAIL_CLIENT_SECRET,
        GOOGLE_GMAIL_REDIRECT_URI
    );

    gmailOAuthClient.setCredentials({
        refresh_token: GOOGLE_GMAIL_REFRESH_TOKEN,
    });

    return gmailOAuthClient;
}

async function sendEmail({ to, subject, html, from }) {
    const auth = getGmailAuthClient();
    const gmail = google.gmail({ version: "v1", auth });

    // El remitente debe coincidir con la cuenta de Gmail que autorizó el
    // refresh token (la que usaste para generarlo en el OAuth Playground).
    const sender = from || process.env.EMAIL_USER || "me";

    const message = [
        `From: ${sender}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        "Content-Type: text/html; charset=UTF-8",
        "",
        html,
    ].join("\n");

    const encodedMessage = Buffer.from(message)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

    const res = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw: encodedMessage,
        },
    });

    return res.data;
}

module.exports = {
    sendEmail,
};