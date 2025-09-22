import fs from 'fs-extra';
import { fileTypeFromFile } from 'file-type';
import { searchImages } from '../model/imagesModel.js';

const validateImagesType = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const filePath = req.file.path;
        const fileType = await fileTypeFromFile(filePath);
        const allowedMimes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/svg+xml'
        ];

        if (!fileType || !allowedMimes.includes(fileType.mime)) {
            await fs.unlink(filePath);
            return res.status(400).json({
                success: false,
                error: 'File is not a valid image type'
            });
        }

        req.file.detectedMime = fileType.mime;
        next();
    } catch (error) {
        if (req.file && await fs.pathExists(req.file.path)) {
            await fs.unlink(req.file.path);
        }
        return res.status(500).json({
            success: false,
            error: 'Error validating file type'
        });
    }
};

const validateFontsType = async (req, res, next) => {
    if (!req.file) {
        return next();
    }

    try {
        const filePath = req.file.path;
        const fileType = await fileTypeFromFile(filePath);

        const allowedFontMimes = [
            'font/ttf',
            'font/otf',
            'font/woff',
            'font/woff2',
            'application/font-woff',
            'application/font-woff2',
            'application/x-font-ttf',
            'application/x-font-truetype',
            'application/x-font-opentype'
        ];

        if (!fileType || !allowedFontMimes.includes(fileType.mime)) {
            await fs.promises.unlink(filePath);
            return res.status(400).json({
                success: false,
                error: 'File is not a valid font type'
            });
        }

        req.file.detectedMime = fileType.mime;
        next();
    } catch (error) {
        if (req.file) {
            try {
                await fs.promises.unlink(req.file.path);
            } catch (unlinkError) {
                console.error('Error deleting invalid file:', unlinkError);
            }
        }
        return res.status(500).json({
            success: false,
            error: 'Error validating font file type'
        });
    }
};

const validateBase64Image = (req, res, next) => {
    const { designId, finalImage } = req.body;
    console.log('Missing designId or finalImage in request body');
    if (!designId || !finalImage) {
        return res.status(400).json({
            error: 'designId and finalImage are required'
        });
    }

    if (designId.includes('..') || designId.includes('/') || designId.includes('\\')) {
        return res.status(400).json({
            error: 'Invalid file name'
        });
    }

    const base64Regex = /^data:image\/(png|jpeg|jpg|gif);base64,/;
    if (!base64Regex.test(finalImage)) {
        return res.status(400).json({
            error: 'Invalid Base64 format. Must be an image (png, jpeg, jpg, gif)'
        });
    }

    const idRegex = /^[a-zA-Z0-9-_.]+$/;
    if (!idRegex.test(designId)) {
        return res.status(400).json({
            error: 'designId must only contain letters, numbers, dash (-), and underscore (_)'
        });
    }

    const base64DataWithoutPrefix = finalImage.replace(/^data:image\/\w+;base64,/, '');
    const sizeInBytes = Math.ceil((base64DataWithoutPrefix.length * 3) / 4);
    const maxSize = 10 * 1024 * 1024;

    if (sizeInBytes > maxSize) {
        return res.status(400).json({
            error: 'Image size too large. Maximum 10MB'
        });
    }

    next();
};

const validateRoleUpload = (req, res, next) => {
    console.log('User role:');
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: User not authenticated'
        });
    }

    const { role } = req.user;

    const allowedRoles = ['irysUp', 'creator'];

    if (!allowedRoles.includes(role)) {
        return res.status(403).json({
            success: false,
            message: 'Invalid role for promotion'
        });
    }

    next();
};

const validateRoleDelete = async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: User not authenticated'
        });
    }

    const { imageName } = req.params;

    const result = await searchImages({ imageName });

    if (!result) {
        return res.status(404).json({
            success: false,
            message: 'Image not found'
        });
    }

    const { irysId } = req.user;

    if (irysId !== result.irysId) {
        return res.status(403).json({
            success: false,
            message: 'Invalid irysId for delete: You are not the owner of this image'
        });
    }

    next();
};

const validateRoleCreator = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: User not authenticated'
        });
    }

    const { role } = req.user;
    const allowedRoles = ['irysUp', 'creator'];

    if (!allowedRoles.includes(role)) {
        return res.status(403).json({
            success: false,
            message: 'Invalid role for use'
        });
    }

    next();
};

export {
    validateImagesType,
    validateFontsType,
    validateBase64Image,
    validateRoleUpload,
    validateRoleDelete,
    validateRoleCreator
};