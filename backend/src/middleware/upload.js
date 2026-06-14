const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directorio de subida local
const uploadDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ⚠️ TODO: Almacenamiento local NO es compatible con múltiples instancias.
// En una arquitectura cloud con auto-scaling, cada instancia tendría su propio
// sistema de archivos, por lo que las imágenes no serían accesibles entre instancias.
//
// Migrar a almacenamiento en la nube:
//   - AWS S3 (usar multer-s3)
//   - Google Cloud Storage
//   - Azure Blob Storage
//   - Cloudflare R2

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const isValid = allowed.test(path.extname(file.originalname).toLowerCase()) &&
                  allowed.test(file.mimetype);
  isValid ? cb(null, true) : cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
