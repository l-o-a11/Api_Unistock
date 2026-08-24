// infrastructure/routes/uploadRoutes.js
//
// Portado desde back/src/infrastructures/routes/uploadRoutesCloudinary.js.
// Endpoint genérico de subida de archivos a Cloudinary vía multipart/form-data
// (distinto del flujo de insumos, que sube imágenes en base64 dentro del JSON
// usando cloudinary.service.js). Se deja como ruta independiente para no tocar
// nada de lo ya existente.
//
// ⚠️ Requiere la dependencia "multer-storage-cloudinary" (no usada en el
// resto de Api). Si no está instalada: npm install multer-storage-cloudinary
//
//  POST   /api/upload              — Subir una imagen (campo "file")
//  POST   /api/upload-multiple     — Subir varias imágenes (campo "files", máx. 10)
//  DELETE /api/upload/:publicId    — Eliminar imagen de Cloudinary por public_id

const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinary/cloudinary.config");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const router = express.Router();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "unistock/products",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes (JPG, PNG, GIF, WebP)"), false);
    }
  },
});

router.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No se subió ningún archivo" });
    }

    const src = req.file.secure_url || req.file.path;
    const public_id = req.file.public_id || req.file.filename;

    res.json({
      success: true,
      url: src,
      src,
      public_id,
      filename: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    console.error("❌ [SINGLE] Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post("/upload-multiple", upload.array("files", 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No se subieron archivos" });
    }

    const images = req.files.map((file) => {
      const src = file.secure_url || file.path;
      const public_id = file.public_id || file.filename;
      return {
        src,
        public_id,
        label: file.originalname,
        filename: file.originalname,
        size: file.size,
      };
    });

    res.json({ success: true, images });
  } catch (error) {
    console.error("❌ [MULTIPLE] Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete("/upload/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    const decodedPublicId = decodeURIComponent(publicId);

    const result = await cloudinary.uploader.destroy(decodedPublicId);

    if (result.result === "ok") {
      res.json({ success: true, message: "Imagen eliminada correctamente" });
    } else {
      res
        .status(404)
        .json({ success: false, error: "No se pudo eliminar la imagen" });
    }
  } catch (error) {
    console.error("❌ Error eliminando:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
