import express from 'express';
import {
    uploadImagesFile,
    uploadFontFile
} from '../config/multerConfig.js';
import {
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
} from '../controller/imagesController.js';
import {
    validateImagesType,
    validateFontsType,
    validateBase64Image,
    validateRoleUpload,
    validateRoleDelete,
    validateRoleCreator
} from '../middleware/uploadsMiddleware.js';
import verifyToken from '../middleware/jwtMiddleware.js';
import verifyTokenHeader from '../middleware/verifyTokenHeader.js'

const routerImgCreator = express.Router();

routerImgCreator.post('/images', verifyTokenHeader, validateRoleUpload, uploadImagesFile.single('image'), validateImagesType, uploadImagesCreator);
routerImgCreator.get('/all/images', verifyToken, getAllImage);
routerImgCreator.delete('/images/:filename', verifyTokenHeader, validateRoleUpload, deletedImage);

routerImgCreator.post('/fonts', verifyTokenHeader, validateRoleUpload, uploadFontFile.single('font'), validateFontsType, uploadFont);
routerImgCreator.get('/all/fonts', verifyToken, getAllFont);
routerImgCreator.delete('/fonts/:filename', verifyTokenHeader, validateRoleUpload, deletedFont); 

routerImgCreator.post('/result', verifyTokenHeader, validateBase64Image, uploadResultImage);
routerImgCreator.delete('/result/:filename', verifyTokenHeader, validateRoleUpload, deletedImageResult); 

routerImgCreator.post('/upload', verifyTokenHeader, validateRoleUpload, upload);
routerImgCreator.post('/search', search);
routerImgCreator.delete('/delet/:imageName', verifyToken, validateRoleDelete, imagesDelet);
routerImgCreator.post('/use/images', verifyToken, useImages);


export {
    routerImgCreator,
}