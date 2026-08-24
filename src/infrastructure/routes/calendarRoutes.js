const { Router } = require("express");
const ctrl = require("../controllers/calendarController");

const router = Router();

router.get("/status", ctrl.getStatus);
router.get("/auth-url", ctrl.getAuthUrlHandler);
router.get("/oauth2callback", ctrl.oauth2Callback);
router.get("/calendars", ctrl.listCalendars);
router.get("/events", ctrl.listEvents);
router.post("/events", ctrl.createEvent);
router.delete("/events/:eventId", ctrl.deleteEvent);

module.exports = router;
