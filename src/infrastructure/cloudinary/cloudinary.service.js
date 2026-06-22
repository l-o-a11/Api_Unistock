const cloudinary = require('./cloudinary.config');

/**
 * Sube una imagen a Cloudinary desde base64 o URL.
 * @param {string} imageData  - base64 (data:image/...;base64,...) o URL externa
 * @param {string} publicId   - ID único para guardar/sobrescribir (ej: "insumos/abc123")
 * @returns {{ url: string, public_id: string }}
 */
async function uploadImage(imageData, publicId) {
  const options = {
    folder: 'insumos',
    public_id: publicId,          // si ya existe, lo sobrescribe
    overwrite: true,
    resource_type: 'image',
    transformation: [
      { width: 800, height: 800, crop: 'limit' },  // nunca agranda
      { quality: 'auto', fetch_format: 'auto' },    // WebP/AVIF automático
    ],
  };

  const result = await cloudinary.uploader.upload(imageData, options);
  return { url: result.secure_url, public_id: result.public_id };
}

/**
 * Elimina una imagen de Cloudinary por su public_id.
 * @param {string} publicId  - public_id almacenado en la BD (ej: "insumos/abc123")
 */
async function deleteImage(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

module.exports = { uploadImage, deleteImage };
