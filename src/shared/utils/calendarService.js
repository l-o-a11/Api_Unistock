const {
  listCalendars,
  createEvent,
  listEvents,
  deleteEvent,
  hasGoogleCredentials,
  getAuthUrl,
  handleCallback,
  loadToken,
} = require("./googleService");

const listUserCalendars = async () => {
  return await listCalendars();
};

const createCalendarEvent = async ({
  calendarId = "primary",
  summary,
  description,
  start,
  end,
  attendees = [],
  location = "",
}) => {
  return await createEvent({
    calendarId,
    summary,
    description,
    start,
    end,
    attendees,
    location,
  });
};

const getCalendarEvents = async ({
  calendarId = "primary",
  timeMin,
  timeMax,
  maxResults = 10,
}) => {
  return await listEvents({ calendarId, timeMin, timeMax, maxResults });
};

const removeCalendarEvent = async ({ calendarId = "primary", eventId }) => {
  return await deleteEvent({ calendarId, eventId });
};

module.exports = {
  listUserCalendars,
  createCalendarEvent,
  getCalendarEvents,
  removeCalendarEvent,
  hasGoogleCredentials,
  getAuthUrl,
  handleCallback,
  loadToken,
};
