// src/middlewares/upload.middleware.js
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),  // archivo en RAM, sin tocar el disco
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (ALLOWED.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (jpeg, png, webp, gif)"), false);
    }
  },
});

module.exports = upload;
