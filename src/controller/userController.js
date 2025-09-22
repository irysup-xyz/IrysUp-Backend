import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs-extra';
import path, { join } from 'path';
import { verifyMessage } from 'ethers';
import { dbPool } from '../config/dbPoolConfig.js';
import {
    userRegister,
    userActivityRegister,
    requestLogin,
    userLogin,
    userUpdateData,
    userPromotion,
    userActivityLogin,
    deleteUser,
    userId,
    requestAllUsers,
    getUserCollections,
    cekUserExist,
    updateUserEvmAddress,
    cekUserAddress,
    userFile,
    searchUserFile
} from '../model/userModel.js';

const tryRegister = async (req, res) => {
    try {
        const payload = { message: 'User try register' };
        const secret = process.env.JWT_SECRET || 'jwt-secret';
        const expiresIn = process.env.EXPIRES_IN || 60;
        const token = jwt.sign(payload, secret, { expiresIn });

        return res.status(200).json({
            message: 'Try user register success',
            token: token,
        });
    } catch (error) {
        console.error('Try register error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const register = async (req, res) => {
    try {
        const { name, regisData, address } = req.body;

        const result = await userRegister({ name, regisData, address });

        if (!result) {
            return res.status(401).json({ message: 'Invalid register credentials' });
        }

        await userActivityRegister(result.generatedIrysId);

        const payload = {
            id: result.insertId,
            name,
            address,
            role: result.role,
            irysId: result.generatedIrysId
        };

        const secret = process.env.JWT_SECRET || 'jwt-secret';
        const expiresIn = process.env.EXPIRES_IN || 60 * 60 * 24;
        const token = jwt.sign(payload, secret, { expiresIn });

        res.status(201).json({
            success: true,
            message: 'Register user success',
            data: {
                id: result.insertId,
                name,
                address,
                role: result.role,
                irysId: result.generatedIrysId
            },
            token: token,
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            serverMessage: error.message,
        });
    }
};

const request = async (req, res) => {
    try {
        const { name } = req.body;
        const result = await requestLogin(name);

        if (!result) {
            return res.status(401).json({ message: 'User not found' });
        }

        await userActivityLogin(result.irysId);

        const payload = {
            id: result.insertId,
            name: result.name,
            address: result.address,
            role: result.role,
            irysId: result.irysId
        };

        const secret = process.env.JWT_SECRET || 'jwt-secret';
        const expiresIn = process.env.EXPIRES_IN || 60; 
        const token = jwt.sign(payload, secret, { expiresIn });

        res.status(201).json({
            success: true,
            message: 'Request salt success',
            data: {
                address: result.address 
            },
            token: token,
        });
    } catch (error) {
        console.error('Request data login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
            serverMessage: error.message,
        });
    }
};

const login = async (req, res) => {
    try {
        const { regisData, name } = req.body;

        const result = await userLogin(name);
        if (!result) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isLoginSuccess = await bcrypt.compare(regisData, result.regisData);

        if (isLoginSuccess) {
            await userActivityLogin(result.irysId);

            const payload = {
                id: result.insertId,
                name: result.name,
                address: result.address,
                role: result.role,
                irysId: result.irysId,
                evmVerified: result.evmVerified
            };

            const secret = process.env.JWT_SECRET || 'jwt-secret';
            const expiresIn = process.env.EXPIRES_IN || 60 * 60 * 24;
            const token = jwt.sign(payload, secret, { expiresIn });

            return res.status(200).json({
                success: true,
                message: 'Login success',
                data: {
                    id: result.insertId,
                    name: result.name,
                    role: result.role,
                    irysId: result.irysId,
                    aboutMe: result.aboutMe,
                    profilUrl: result.profilUrl,
                    evmAddress: result.evmAddress,
                    irysAddress: result.irysAddress,
                    evmVerified: result.evmVerified,
                    x: result.x,
                    discord: result.discord,
                    irysMail: result.irysMail,
                    irysGit: result.irysGit
                },
                token: token,
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials login'
            });
        }
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};

const updateData = async (req, res) => {
    try {
        const { name, regisData, address, aboutMe, evmAddress,
            irysAddress, x, discord, irysMail, irysGit } = req.body;

        const updateFields = {};

        if (name !== undefined) updateFields.name = name;
        if (regisData !== undefined) updateFields.regisData = regisData;
        if (address !== undefined) updateFields.address = address;
        if (aboutMe !== undefined) updateFields.aboutMe = aboutMe;
        if (evmAddress !== undefined) updateFields.evmAddress = evmAddress;
        if (irysAddress !== undefined) updateFields.irysAddress = irysAddress;
        if (x !== undefined) updateFields.x = x;
        if (discord !== undefined) updateFields.discord = discord;
        if (irysMail !== undefined) updateFields.irysMail = irysMail;
        if (irysGit !== undefined) updateFields.irysGit = irysGit;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No data updated"
            });
        }
        const { irysId } = req.params;
        const result = await userUpdateData(irysId, updateFields);

        res.status(200).json({
            success: true,
            message: "Update success",
            data: result
        });

    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const updateDataimg = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const { irysId } = req.params;

        if (!irysId) {
            if (await fs.pathExists(req.file.path)) {
                await fs.unlink(req.file.path);
            }
            return res.status(400).json({
                success: false,
                error: 'irysId is required'
            });
        }

        const result = await userId(irysId);
        const oldProfileUrl = result?.profilUrl;

        if (oldProfileUrl) {
            try {
                const filename = new URL(oldProfileUrl).pathname.split('/').pop();
                const filePath = path.join('public/profil/', filename);

                if (await fs.pathExists(filePath)) {
                    await fs.unlink(filePath); 
                    console.log(`Deleted old profile image: ${filePath}`);
                } else {
                    console.warn(`Old profile image not found on disk: ${filePath}`);
                }
            } catch (error) {
                console.error('Error deleting existing profile image:', error.message);
            };
        };

        const profilUrl = `${req.protocol}://${req.get('host')}/public/profil/${req.file.filename}`;
        const updateFields = { profilUrl };

        const update = await userUpdateData(irysId, updateFields);

        if (update.affectedRows === 0) {
            if (await fs.pathExists(req.file.path)) {
                await fs.unlink(req.file.path);
            }
            return res.status(404).json({
                success: false,
                error: 'User not found or no changes applied'
            });
        };

        res.status(200).json({
            success: true,
            message: 'File uploaded and user updated successfully',
            filename: req.file.filename,
            profilUrl,
            update,
        });

    } catch (error) {
        console.error('Upload error:', error);

        if (req.file && await fs.pathExists(req.file.path)) {
            await fs.unlink(req.file.path);
        }

        res.status(500).json({
            success: false,
            error: error.message || 'Internal server error'
        });
    }
};

const promotion = async (req, res) => {
    try {
        const { irysId, role } = req.body;

        const updateFields = {};
        if (role !== undefined) updateFields.role = role;
        const result = await userPromotion(irysId, updateFields);

        res.status(200).json({
            success: true,
            message: "Promotion user success",
            data: result
        });
    } catch (error) {
        console.error('Promotion user error:', error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    };
};

const userDelete = async (req, res) => {
    try {
        const { irysId } = req.params;

        if (!irysId) {
            return res.status(400).json({
                success: false,
                message: "irysId is required and cannot be empty"
            });
        }

        const result = await deleteUser(irysId);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Delete user success",
            data: result
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const verifySignature = async (req, res) => {
    const { irysId, address, signature, message, irysAddress } = req.body;

    try {
        const verifiedAddress = verifyMessage(message, signature);

        if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: 'Signature does not match the provided address.',
            });
        }

        const rows = await cekUserExist(irysId);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User with this IrysID not found.',
            });
        }

        console.log('User found:', address);

        const result = await updateUserEvmAddress(irysId, address, irysAddress); 

        if (result.affectedRows === 0) {
            return res.status(500).json({
                success: false,
                message: 'Failed to update user record.',
            });
        }

        res.json({
            success: true,
            message: 'Wallet verified and saved!',
            data: {
                evmAddress: address,
                irysAddress, 
                evmVerified: true,
            },
        });

    } catch (error) {
        console.error('Error in verifySignature:', error.message);
        res.status(500).json({
            success: false,
            message: 'Verification failed due to server error.',
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await requestAllUsers(); 
        res.status(200).json({
            success: true,
            message: "All users retrieved successfully",
            data: users 
        });
    } catch (error) {
        console.error('Error fetching all users:', error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

const getUserCollection = async (req, res) => {
    try {
        const { irysId } = req.params;
        const collections = await getUserCollections(irysId);
        res.status(200).json({
            success: true,
            message: "User collections retrieved successfully",
            data: collections
        });
    } catch (error) {
        console.error('Error fetching user collections:', error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    };
};

const verifySignatureAddress = async (req, res) => {
    const { irysId, address, signature, message, irysAddress } = req.body;

    try {
        const verifiedAddress = verifyMessage(message, signature);

        if (verifiedAddress.toLowerCase() !== address.toLowerCase()) {
            return res.status(400).json({
                success: false,
                message: 'Signature does not match the provided address.',
            });
        }

        const result = await cekUserAddress(irysId);

        console.log('User found for address verification:', result);
        console.log('Provided address:', address);

        if (result?.evmAddress === '') {
            return res.status(400).json({
                success: false,
                message: 'No EVM address registered in profile. Please connect wallet first.',
            });
        }

        if (result?.evmAddress !== address) {
            return res.status(400).json({
                success: false,
                message: 'EVM address does not match the one registered in your profile.',
            });
        };

        console.log('✅ Wallet verification passed for:', address);

        res.json({
            success: true,
            message: 'Wallet verification successful!',
            data: {
                evmAddress: address,
                irysAddress,
                evmVerified: true,
            },
        });

    } catch (error) {
        console.error('Error in verifySignature:', error.message);
        res.status(500).json({
            success: false,
            message: 'Verification failed due to server error.',
        });
    }
};

const addFile = async (req, res) => {
    try {
        const { irysId, irysAddress, fileName, fileUrl, fileType, fileSize, transactionId, date } = req.body;

        if (!irysId || !fileName || fileUrl === undefined) {
            return res.status(400).json({
                success: false,
                message: "irysId, fileName, and fileUrl are required."
            });
        }

        const result = await userFile({
            irysId,
            irysAddress,
            fileName,
            fileUrl,
            fileType,
            transactionId,
            fileSize,
            date
        });

        res.status(200).json({
            success: true,
            message: result.insertId
                ? "New record created and file added."
                : "File appended to existing record.",
            data: {
                affectedRows: result.affectedRows,
                insertId: result.insertId,
                changed: result.changedRows 
            }
        });

    } catch (error) {
        console.error("Error in addFile controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error
        });
    }
};

const getUserFile = async (req, res) => {
    try {
        const { irysId } = req.params;
        if (!irysId) {
            return res.status(400).json({
                success: false,
                message: "irysId is required."
            });
        };

        const result = await searchUserFile(irysId);
        if (!result) {
            return res.status(404).json({
                success: false,
                message: "No files found for this irysId."
            });
        };

        res.status(200).json({
            success: true,
            message: "Files retrieved successfully.",
            data: result
        });

    } catch (error) {
        console.error("Error in getUserFile controller:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error
        });
    }
};

export {
    tryRegister,
    register,
    request,
    login,
    updateData,
    updateDataimg,
    promotion,
    userDelete,
    verifySignature,
    requestAllUsers,
    getAllUsers,
    getUserCollection,
    verifySignatureAddress,
    addFile,
    getUserFile
}