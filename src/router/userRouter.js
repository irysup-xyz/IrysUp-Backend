import express from 'express';
import {
    uploadImagesProfil
} from '../config/multerConfig.js';
import {
    tryRegister,
    register,
    request,
    login,
    updateData,
    updateDataimg,
    promotion,
    userDelete,
    verifySignature,
    getAllUsers,
    getUserCollection,
    verifySignatureAddress,
    addFile,
    getUserFile
} from '../controller/userController.js';
import {
    validateUserRegistration,
    validateRequestLogin,
    ValidateUserLogin,
    validatePromotion,
    validateDelete
} from '../middleware/userMiddleware.js';
import {
    validateImagesType
} from '../middleware/uploadsMiddleware.js';
import verifyToken from '../middleware/jwtMiddleware.js';
import verifyTokenHeader from '../middleware/verifyTokenHeader.js'

const routerUser = express.Router();

routerUser.get('/request/register', tryRegister);
routerUser.post('/register', verifyToken, validateUserRegistration, register);
routerUser.post('/request/login', validateRequestLogin, request);
routerUser.post('/login', verifyToken, ValidateUserLogin, login);
routerUser.patch('/update/:irysId', verifyToken, updateData);
routerUser.patch('/update/profil/:irysId', verifyTokenHeader, uploadImagesProfil.single('image'), validateImagesType, updateDataimg);
routerUser.post('/promotion', verifyToken, validatePromotion, promotion);
routerUser.delete('/delete/:irysId', verifyToken, validateDelete, userDelete);
routerUser.post('/verify-signature', verifyToken, verifySignature);
routerUser.post('/verify-address', verifyToken, verifySignatureAddress);
routerUser.get('/all/users', getAllUsers);
routerUser.get('/collection/:irysId', getUserCollection);addFile
routerUser.post('/irysup-storage', verifyToken, addFile); 
routerUser.get('/irysup-storage/:irysId', verifyTokenHeader, getUserFile);

export {
    routerUser,
};