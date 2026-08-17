const {
  listUserCalendars,
  createCalendarEvent,
  getCalendarEvents,
  removeCalendarEvent,
  hasGoogleCredentials,
  getAuthUrl,
  handleCallback,
  loadToken,
} = require("../../shared/utils/calendarService");
const { ok, badRequest, serverError } = require("../../shared/utils/response");

const getStatus = (req, res) => {
  try {
    const configured = hasGoogleCredentials();
    const token = loadToken();
    return ok(res, { configured, authorized: !!token });
  } catch (err) {
    console.error("[calendarController][status]", err);
    return serverError(res, err.message || "No se pudo determinar el estado de Google Calendar");
  }
};

const getAuthUrlHandler = (req, res) => {
  try {
    if (!hasGoogleCredentials()) {
      return badRequest(res, "Google Calendar no configurado.");
    }
    const url = getAuthUrl();
    return ok(res, { authUrl: url });
  } catch (err) {
    console.error("[calendarController][auth-url]", err);
    return serverError(res, err.message);
  }
};

const oauth2Callback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return badRequest(res, "Falta el parámetro code");
    }
    const tokens = await handleCallback(code);
    return ok(res, { message: "Autorizado correctamente", tokens });
  } catch (err) {
    console.error("[calendarController][oauth2callback]", err);
    return serverError(res, err.message);
  }
};

const listCalendars = async (req, res) => {
  try {
    if (!hasGoogleCredentials()) {
      return badRequest(res, "Google Calendar no configurado. Coloca credentials.json y configura GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET.");
    }
    const calendars = await listUserCalendars();
    return ok(res, calendars);
  } catch (err) {
    return serverError(res, err.message);
  }
};

const createEvent = async (req, res) => {
  try {
    if (!hasGoogleCredentials()) {
      return badRequest(res, "Google Calendar no configurado.");
    }
    const { calendarId, summary, description, start, end, attendees, location } = req.body;
    if (!summary || !start || !end) {
      return badRequest(res, "summary, start y end son requeridos");
    }
    const event = await createCalendarEvent({
      calendarId,
      summary,
      description,
      start,
      end,
      attendees: attendees || [],
      location: location || "",
    });
    return ok(res, event);
  } catch (err) {
    return serverError(res, err.message);
  }
};

const listEvents = async (req, res) => {
  try {
    if (!hasGoogleCredentials()) {
      return badRequest(res, "Google Calendar no configurado.");
    }
    const { calendarId = "primary", timeMin, timeMax, maxResults = 10 } = req.query;
    const events = await getCalendarEvents({
      calendarId,
      timeMin,
      timeMax,
      maxResults: Number(maxResults),
    });
    return ok(res, events);
  } catch (err) {
    return serverError(res, err.message);
  }
};

const deleteEvent = async (req, res) => {
  try {
    if (!hasGoogleCredentials()) {
      return badRequest(res, "Google Calendar no configurado.");
    }
    const { calendarId = "primary" } = req.query;
    const { eventId } = req.params;
    if (!eventId) {
      return badRequest(res, "eventId es requerido");
    }
    await removeCalendarEvent({ calendarId, eventId });
    return ok(res, { deleted: true });
  } catch (err) {
    return serverError(res, err.message);
  }
};

module.exports = {
  getStatus,
  getAuthUrlHandler,
  oauth2Callback,
  listCalendars,
  createEvent,
  listEvents,
  deleteEvent,
};
