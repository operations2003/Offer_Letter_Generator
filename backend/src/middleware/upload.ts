import multer from 'multer';
import { BadRequestError } from '../errors/app-error.js';

const storage = multer.memoryStorage();

export const uploadDocumentMiddleware = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024, // 15MB
  },
  fileFilter: (_req, file, cb) => {
    const original = file.originalname.toLowerCase();
    const isPdf = original.endsWith('.pdf') || file.mimetype === 'application/pdf';
    const isDocx =
      original.endsWith('.docx') ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      file.mimetype === 'application/docx';
    const isTxt = original.endsWith('.txt') || file.mimetype.startsWith('text/');

    if (isPdf || isDocx || isTxt) {
      cb(null, true);
    } else {
      cb(
        new BadRequestError(
          `Invalid file format for "${file.originalname}". Only PDF (.pdf), DOCX (.docx), and TXT (.txt) files are supported.`
        )
      );
    }
  },
}).single('document');
