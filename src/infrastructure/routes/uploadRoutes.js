// infrastructure/routes/uploadRoutes.js
//
// Portado desde back/src/infrastructures/routes/uploadRoutesCloudinary.js.
// Endpoint genérico de subida de archivos a Cloudinary vía multipart/form-data
// (distinto del flujo de insumos, que sube imágenes en base64 dentro del JSON
// usando cloudinary.service.js). Se deja como ruta independiente para no tocar
// nada de lo ya existente.
//
//  POST   /api/upload              — Subir una imagen (campo "file")
//  POST   /api/upload-multiple     — Subir varias imágenes (campo "files", máx. 10)
//  DELETE /api/upload/:publicId    — Eliminar imagen de Cloudinary por public_id

const express = require("express");
const multer = require("multer");
const cloudinary = require("../cloudinary/cloudinary.config");

const router = express.Router();

const upload = multer({
  // Vercel no garantiza un sistema de archivos persistente. Cloudinary recibe
  // el buffer directamente en uploadToCloudinary.
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes JPG/JPEG o PNG"), false);
    }
  },
});

const uploadToCloudinary = (file) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "unistock/products",
        resource_type: "image",
      },
      (error, result) => (error ? reject(error) : resolve(result)),
    );

    stream.end(file.buffer);
  });

const uploadFiles = (middleware) => (req, res) => {
  middleware(req, res, async (error) => {
    if (error) {
      const status = error instanceof multer.MulterError ? 400 : 500;
      console.error("[Upload] Error procesando archivos:", error);
      return res.status(status).json({
        success: false,
        error: error.message || "No se pudieron procesar los archivos",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: "No se subieron archivos" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("[Upload] Faltan las variables de entorno de Cloudinary");
      return res.status(503).json({
        success: false,
        error: "El servicio de imágenes no está configurado en el servidor",
      });
    }

    try {
      const results = await Promise.all(req.files.map(uploadToCloudinary));
      const images = results.map((result, index) => ({
        src: result.secure_url,
        public_id: result.public_id,
        label: req.files[index].originalname,
        filename: req.files[index].originalname,
        size: req.files[index].size,
      }));

      return res.json({ success: true, images });
    } catch (uploadError) {
      console.error("[Upload] Error subiendo a Cloudinary:", uploadError);
      return res.status(500).json({
        success: false,
        error: uploadError.message || "No se pudieron subir las imágenes",
      });
    }
  });
};

router.post("/upload", (req, res) => {
  upload.single("file")(req, res, async (error) => {
    if (error) {
      const status = error instanceof multer.MulterError ? 400 : 500;
      return res.status(status).json({ success: false, error: error.message });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: "No se subió ningún archivo" });
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return res.status(503).json({
        success: false,
        error: "El servicio de imágenes no está configurado en el servidor",
      });
    }

    try {
      const result = await uploadToCloudinary(req.file);
      return res.json({
        success: true,
        url: result.secure_url,
        src: result.secure_url,
        public_id: result.public_id,
        filename: req.file.originalname,
        size: req.file.size,
      });
    } catch (uploadError) {
      console.error("[Upload] Error subiendo a Cloudinary:", uploadError);
      return res.status(500).json({
        success: false,
        error: uploadError.message || "No se pudo subir la imagen",
      });
    }
  });
});

router.post("/upload-multiple", uploadFiles(upload.array("files", 10)));

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
