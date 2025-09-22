import multer from 'multer';
import path from 'path';
import fs from 'fs-extra';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/images/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = 'irys-' + Date.now();
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

export const uploadImagesFile = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

const fontStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const fontsDir = 'public/fonts/';
        if (!fs.existsSync(fontsDir)) {
            fs.mkdirSync(fontsDir, { recursive: true });
        }
        cb(null, fontsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);
        cb(null, 'font-' + uniqueSuffix + fileExtension);
    }
});

export const uploadFontFile = multer({
    storage: fontStorage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fontFilter: (req, file, cb) => {
        const allowedExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(fileExtension)) {
            cb(null, true);
        } else {
            cb(new Error('Only font files are allowed (TTF, OTF, WOFF, WOFF2)'), false);
        }
    }
});

export const saveImageResult = async (designId, base64Data) => {
    try {
        const base64DataWithoutPrefix = base64Data.replace(/^data:image\/png;base64,/, '');
        const imageBuffer = Buffer.from(base64DataWithoutPrefix, 'base64');

        const imagesDir = 'public/result/';
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        const imagePath = path.join(imagesDir, `${designId}.png`);
        fs.writeFileSync(imagePath, imageBuffer);

        console.log(`Image saved: ${imagePath}`);
        return true;
    } catch (error) {
        console.error('Error saving image:', error);
        return false;
    }
};

const storageUser = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/profil/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = 'profil-' + Date.now();
        const fileExtension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension);
    }
});

export const uploadImagesProfil = multer({
    storage: storageUser,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});