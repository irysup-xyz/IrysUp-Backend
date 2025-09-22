import express from 'express';
import fs from 'fs-extra';
import path from 'path';
import { saveImageResult } from '../config/multerConfig.js';
import {
    uploadImages,
    searchImages,
    deleteImages,
    useImage
} from '../model/imagesModel.js';

const upload = async (req, res) => {
    try {
        const { imageName, imageData, creator_name, creator_irysId } = req.body;
        const result = await uploadImages({ imageName, imageData, creator_name, creator_irysId });

        res.status(201).json({
            success: true,
            message: 'Upload images success',
            data: result,
        });
    } catch (error) {
        console.error('Upload images error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const search = async (req, res) => {
    try {
        const { imageName, creator_name, creator_irysId } = req.body;

        const filters = {};

        if (imageName) filters.imageName = imageName;
        if (creator_name) filters.creator_name = creator_name;
        if (creator_irysId) filters.creator_irysId = creator_irysId;

        const results = await searchImages(filters);

        res.status(200).json({
            success: true,
            data: results,
            count: results.length
        });

    } catch (error) {
        console.error("Search error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const imagesDelet = async (req, res) => {
    try {
        const { imageName } = req.params;
        const result = await deleteImages({ imageName });
        res.status(200).json({
            success: true,
            message: 'Delete images success',
            data: result,
        });
    } catch (error) {
        console.error("Delete error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const useImages = async (req, res) => {
    try {
        const { user_irysId, imageId, imageUserId, imageName } = req.body;
        const result = await useImage({ user_irysId, imageId, imageUserId, imageName });

        res.status(201).json({
            success: true,
            message: 'Use images success',
            data: result,
        });
    } catch (error) {
        console.error("Use error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const uploadImagesCreator = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        let metadata = {};
        if (req.body.metadata) {
            try {
                metadata = JSON.parse(req.body.metadata);
            } catch (e) {
                console.warn('Invalid metadata format');
            }
        }

        const imageUrl = `${req.protocol}://${req.get('host')}/public/images/${req.file.filename}`;

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully',
            filename: req.file.filename,
            originalName: req.file.originalname,
            imageUrl: imageUrl,
            detectedMime: req.file.detectedMime,
            metadata: {
                ...metadata,
                size: req.file.size,
                mimetype: req.file.mimetype
            }
        });

    } catch (error) {
        console.error('Upload error:', error);

        if (req.file && await fs.pathExists(req.file.path)) {
            await fs.unlink(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const getAllImage = (req, res) => {
    const uploadDir = 'uploads/images/';

    if (!fs.existsSync(uploadDir)) {
        return res.json({ images: [] });
    }

    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error reading uploads directory' });
        }

        const images = files.map(file => ({
            filename: file,
            url: `${req.protocol}://${req.get('host')}/public/images/${file}`,
            uploadDate: fs.statSync(path.join(uploadDir, file)).mtime
        }));

        res.json({ images });
    });
};

const deletedImage = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join('public/images', filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'File deleted successfully' });
    } else {
        res.status(404).json({ success: false, error: 'File not found' });
    }
};

const uploadFont = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No font file uploaded'
            });
        }

        const fontUrl = `${req.protocol}://${req.get('host')}/public/fonts/${req.file.filename}`;

        res.json({
            success: true,
            message: 'Font uploaded successfully',
            data: {
                filename: req.file.filename,
                originalName: req.file.originalname,
                size: req.file.size,
                mimetype: req.file.mimetype,
                detectedMime: req.file.detectedMime,
                fontUrl: fontUrl,
                uploadedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Font upload error:', error);

        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const getAllFont = (req, res) => {
    const fontsDir = '/public/fonts';

    fs.readdir(fontsDir, (err, files) => {
        if (err) {
            return res.status(500).json({
                success: false,
                error: 'Error reading fonts directory'
            });
        }

        const fontFiles = files.filter(file =>
            ['.ttf', '.otf', '.woff', '.woff2'].includes(path.extname(file).toLowerCase())
        );

        const fonts = [];

        for (const file of fontFiles) {
            try {
                const filePath = path.join(fontsDir, file);
                const stats = fs.statSync(filePath);

                const getMimeType = (extension) => {
                    const mimeTypes = {
                        '.ttf': 'font/ttf',
                        '.otf': 'font/otf',
                        '.woff': 'font/woff',
                        '.woff2': 'font/woff2'
                    };
                    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
                };

                fonts.push({
                    filename: file,
                    url: `/public/fonts/${file}`,
                    size: stats.size,
                    uploadDate: stats.mtime,
                    mimetype: getMimeType(path.extname(file))
                });
            } catch (error) {
                console.error(`Error reading file ${file}:`, error);
            }
        }

        res.json({
            success: true,
            data: {
                fonts: fonts,
                total: fonts.length
            }
        });
    });
};

const deletedFont = async (req, res) => {
    try {
        const filename = req.params.filename;
        const fontsDir = 'public/fonts/';
        const filePath = path.join(fontsDir, filename);

        if (await fs.pathExists(filePath)) {
            await fs.unlink(filePath);
            return res.json({
                success: true,
                message: 'Font deleted successfully'
            });
        } else {
            return res.status(404).json({
                success: false,
                error: 'Font not found'
            });
        }

    } catch (error) {
        console.error('Font deletion error:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

const uploadResultImage = async (req, res) => {
    try {
        const { designId, finalImage } = req.body;
        if (!designId && !finalImage) {
            return res.status(400).json({
                success: false,
                error: 'Final text and images are required'
            });
        }
        const imageSaved = await saveImageResult(designId, finalImage);
        const resultUrl = `${req.protocol}://${req.get('host')}/public/result/${designId}.png`;

        res.status(201).json({
            success: true,
            message: 'Design saved success',
            resultUrl: resultUrl,
            imageSaved: imageSaved
        });

    } catch (error) {
        console.error('Error saving design:', error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            details: error.message
        });
    }
};

const deletedImageResult = (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join('public/result', filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'File deleted successfully' });
    } else {
        res.status(404).json({ success: false, error: 'File not found' });
    }
};

export {
    upload,
    search,
    imagesDelet,
    useImages,
    uploadImagesCreator,
    getAllImage,
    deletedImage,
    uploadFont,
    getAllFont,
    deletedFont,
    uploadResultImage,
    deletedImageResult
};