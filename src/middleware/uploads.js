import multer from "multer";
import {extname, join} from "path";

const __dirname = import.meta.dirname;

const diskStorageConfig = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(__dirname, "../uploads");
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `logo-${uniqueSuffix}${ext}`);
  },
})

const memoryStorage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, png, webp, gif)'), false);
  }
};

const uploadMiddleware = multer({
  storage: diskStorageConfig,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
})

export const uploadSingle = multer({
  storage: memoryStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
}).single('signature')

export default uploadMiddleware;