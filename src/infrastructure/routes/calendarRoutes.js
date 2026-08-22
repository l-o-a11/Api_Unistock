const { Router } = require("express");
const ctrl = require("../controllers/calendarController");
const { requireAuth, requirePermission } = require("../../interfaces/middlewares/authMiddleware");

const router = Router();
const MODULO = "produccion";

router.get("/status", ctrl.getStatus);
router.get("/auth-url", ctrl.getAuthUrlHandler);
router.get("/oauth2callback", ctrl.oauth2Callback);
router.get("/calendars", requireAuth, requirePermission(MODULO, "leer"), ctrl.listCalendars);
router.get("/events", requireAuth, requirePermission(MODULO, "leer"), ctrl.listEvents);
router.post("/events", requireAuth, requirePermission(MODULO, "crear"), ctrl.createEvent);
router.delete("/events/:eventId", requireAuth, requirePermission(MODULO, "eliminar"), ctrl.deleteEvent);

module.exports = router;
