import { body, validationResult } from 'express-validator';
import { requestLogin } from '../model/userModel.js'

const validateUserRegistration = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters'),
    body('regisData')
        .notEmpty().withMessage('Registration data is required')
        .isLength({ min: 64, max: 64 }).withMessage('regisData must be 64 hex chars (SHA256)')
        .matches(/^[a-f0-9]+$/i).withMessage('regisData must be valid hex string'),
    body('address')
        .notEmpty().withMessage('Address (salt) is required')
        .isLength({ min: 64, max: 64 }).withMessage('Salt must be 64 hex chars (32 bytes)')
        .matches(/^[a-f0-9]+$/i).withMessage('Salt must be valid hex string'),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
const validateRequestLogin = async (req, res, next) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            message: 'Name is required'
        });
    };

    next();
};

const ValidateUserLogin = async (req, res, next) => {
    const { name: targetName, regisData } = req.body;

    if (!targetName || !regisData) {
        return res.status(400).json({
            message: 'Name and regisData is required'
        });
    };

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: User not authenticated'
        });
    };

    const { name: nameRequest } = req.user;

    if (targetName !== nameRequest) {
        return res.status(403).json({
            success: false,
            message: 'Invalid name: does not match authenticated user'
        });
    }

    if (typeof regisData !== 'string' || regisData.length !== 64 || !/^[a-f0-9]+$/i.test(regisData)) {
        return res.status(400).json({
            message: 'Invalid regisData format'
        });
    }

    next();
};

const validatePromotion = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: User not authenticated'
        });
    }

    const { role } = req.user;
    if (role !== 'irysUp') {
        return res.status(403).json({
            success: false,
            message: 'Invalid role for promotion'
        });
    };
    next();
};

const validateDelete = (req, res, next) => {
    const { irysId: targetIrysId } = req.params;
    if (!targetIrysId) {
        return res.status(400).json({
            success: false,
            message: "irysId is required and cannot be empty"
        });
    }

    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized: User not authenticated'
        });
    }

    const { irysId: userIrysId } = req.user;

    if (userIrysId !== targetIrysId) {
        return res.status(403).json({
            success: false,
            message: 'Forbidden: You can only delete your own account'
        });
    }

    next();
};

export {
    validateUserRegistration,
    validateRequestLogin,
    ValidateUserLogin,
    validatePromotion,
    validateDelete
};
