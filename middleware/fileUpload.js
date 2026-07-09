import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload folders exist
const resumeDir = './uploads/resumes';
const profileDir = './uploads/profiles';

if (!fs.existsSync(resumeDir)) {
  fs.mkdirSync(resumeDir, { recursive: true });
}
if (!fs.existsSync(profileDir)) {
  fs.mkdirSync(profileDir, { recursive: true });
}

// Storage configurations
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === 'resume') {
      cb(null, resumeDir);
    } else if (file.fieldname === 'profilePicture') {
      cb(null, profileDir);
    } else {
      cb(new Error('Invalid field name'), false);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File validation filters
const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'resume') {
    const filetypes = /pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype === 'application/pdf';

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Only PDF resumes are allowed!'), false);
    }
  } else if (file.fieldname === 'profilePicture') {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png|webp)/.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      return cb(new Error('Only images (JPEG, JPG, PNG, WEBP) are allowed!'), false);
    }
  } else {
    cb(new Error('Unknown upload field'), false);
  }
};

export const uploadResume = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter,
}).single('resume');

export const uploadProfilePicture = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: fileFilter,
}).single('profilePicture');
