const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");

const SCOPES = [
  "https://www.googleapis.com/auth/gmail.send",
  "https://www.googleapis.com/auth/gmail.modify",
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
];

const TOKEN_PATH = path.join(__dirname, "..", "..", "..", "token.json");
const CREDENTIALS_PATH = path.join(__dirname, "..", "..", "..", "credentials.json");

let authClient = null;
let gmail = null;
let calendar = null;

function hasGoogleCredentials() {
  if (fs.existsSync(CREDENTIALS_PATH)) {
    try {
      const content = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
      const credentials = JSON.parse(content);
      const { client_secret, client_id } = credentials.web || credentials.installed;
      if (client_id && client_secret) return true;
    } catch {
      // ignore and fallback to env
    }
  }
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function loadCredentials() {
  if (fs.existsSync(CREDENTIALS_PATH)) {
    try {
      const content = fs.readFileSync(CREDENTIALS_PATH, "utf-8");
      const credentials = JSON.parse(content);
      const { client_secret, client_id } = credentials.web || credentials.installed;
      if (client_id && client_secret) return { client_secret, client_id };
    } catch {
      // ignore and fallback to env
    }
  }
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!client_id || !client_secret) {
    throw new Error(
      "Faltan las credenciales de Google. " +
      "Coloca credentials.json en la raíz o define GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env."
    );
  }
  return { client_secret, client_id };
}

function loadToken() {
  if (!fs.existsSync(TOKEN_PATH)) return null;
  return JSON.parse(fs.readFileSync(TOKEN_PATH, "utf-8"));
}

function saveToken(token) {
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(token, null, 2));
}

function getSmtpTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    auth: {
      user: process.env.EMAIL_USER?.trim(),
      pass: process.env.EMAIL_PASS?.trim(),
    },
  });
}

async function getAuthenticatedClient() {
  if (authClient) return authClient;

  if (!hasGoogleCredentials()) {
    throw new Error(
      `Faltan las credenciales de Google en ${CREDENTIALS_PATH}. ` +
      "Descargue el JSON de credenciales OAuth2 desde Google Cloud Console."
    );
  }

  const { client_secret, client_id } = loadCredentials();
  const token = loadToken();

  authClient = new google.auth.OAuth2(client_id, client_secret);

  if (token) {
    authClient.setCredentials(token);
    return authClient;
  }

  throw new Error(
    "GOOGLE_OAUTH_REQUIRED:" +
    (process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/oauth2callback")
  );
}

function getAuthUrl() {
  const { client_secret, client_id } = loadCredentials();
  const redirectUrl = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/oauth2callback";
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUrl);
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });
  return authUrl;
}

async function handleCallback(code) {
  const { client_secret, client_id } = loadCredentials();
  const redirectUrl = process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/oauth2callback";
  const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirectUrl);
  const { tokens } = await oAuth2Client.getToken(code);
  saveToken(tokens);
  authClient = new google.auth.OAuth2(client_id, client_secret, redirectUrl);
  authClient.setCredentials(tokens);
  return tokens;
}

async function getGmail() {
  if (gmail) return gmail;
  const auth = await getAuthenticatedClient();
  gmail = google.gmail({ version: "v1", auth });
  return gmail;
}

async function getCalendar() {
  if (calendar) return calendar;
  const auth = await getAuthenticatedClient();
  calendar = google.calendar({ version: "v3", auth });
  return calendar;
}

async function sendEmail({ to, subject, html, from }) {
  if (hasGoogleCredentials()) {
    try {
      const gmailClient = await getGmail();
      const sender = from || (process.env.EMAIL_USER?.trim()) || "me";

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

      const res = await gmailClient.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });

      return res.data;
    } catch (error) {
      console.error("Error enviando correo con Gmail API, usando SMTP como respaldo:", error.message);
    }
  }

  const transporter = getSmtpTransporter();
  const sender = from || (process.env.EMAIL_USER?.trim());
  const res = await transporter.sendMail({
    from: `"Equipo Unistock" <${sender}>`,
    to,
    subject,
    html,
  });
  return res;
}

async function listCalendars() {
  if (!hasGoogleCredentials()) {
    throw new Error(
      "Para usar Calendar debes configurar Google OAuth2. " +
      "Coloca credentials.json en la raíz y define GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env"
    );
  }
  const calendarClient = await getCalendar();
  const res = await calendarClient.calendarList.list();
  return res.data.items || [];
}

async function createEvent({ calendarId, summary, description, start, end, attendees = [], location = "" }) {
  if (!hasGoogleCredentials()) {
    throw new Error(
      "Para usar Calendar debes configurar Google OAuth2. " +
      "Coloca credentials.json en la raíz y define GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env"
    );
  }
  const calendarClient = await getCalendar();
  const targetCalendar = calendarId || "primary";

  const event = {
    summary,
    description,
    location,
    start: typeof start === "string" ? { dateTime: start } : start,
    end: typeof end === "string" ? { dateTime: end } : end,
    attendees: attendees.map((email) => ({ email })),
  };

  const res = await calendarClient.events.insert({
    calendarId: targetCalendar,
    requestBody: event,
    sendUpdates: "all",
  });

  return res.data;
}

async function listEvents({ calendarId = "primary", timeMin, timeMax, maxResults = 10 }) {
  if (!hasGoogleCredentials()) {
    throw new Error(
      "Para usar Calendar debes configurar Google OAuth2. " +
      "Coloca credentials.json en la raíz y define GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env"
    );
  }
  const calendarClient = await getCalendar();
  const res = await calendarClient.events.list({
    calendarId,
    timeMin: timeMin || new Date().toISOString(),
    timeMax: timeMax,
    maxResults,
    singleEvents: true,
    orderBy: "startTime",
  });
  return res.data.items || [];
}

async function deleteEvent({ calendarId = "primary", eventId }) {
  if (!hasGoogleCredentials()) {
    throw new Error(
      "Para usar Calendar debes configurar Google OAuth2. " +
      "Coloca credentials.json en la raíz y define GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en .env"
    );
  }
  const calendarClient = await getCalendar();
  await calendarClient.events.delete({
    calendarId,
    eventId,
  });
}

module.exports = {
  sendEmail,
  listCalendars,
  createEvent,
  listEvents,
  deleteEvent,
  getAuthenticatedClient,
  hasGoogleCredentials,
  getAuthUrl,
  handleCallback,
  loadToken,
};
