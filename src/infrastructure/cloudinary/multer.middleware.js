const multer = require('multer');

// Guardamos el archivo en memoria como Buffer (sin tocar el disco)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (ALLOWED.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, png, webp, gif)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
