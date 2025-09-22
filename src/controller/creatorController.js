import {
    creatorRegister,
    registSuccess,
    getAllCreators
} from '../model/creatorModel.js';

const registerCreator = async (req, res) => {
    try {
        const { name, irysId, link } = req.body;
        const result = await creatorRegister({ name, irysId, link });

        res.status(201).json({
            success: true,
            message: 'Success',
            data: result,
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const successRegist = async (req, res) => {
    try {
        const { irysId } = req.body;
        const result = await registSuccess({ irysId });

        res.status(201).json({
            success: true,
            message: 'Success',
            data: result,
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const getAllRegist = async (req, res) => {
    try {
        const creators = await getAllCreators();
        res.status(200).json(creators);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    registerCreator,
    successRegist,
    getAllRegist
};