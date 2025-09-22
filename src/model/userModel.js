import { body } from 'express-validator';
import { dbPool } from '../config/dbPoolConfig.js';
import bcrypt from 'bcrypt';

const generateIrysId = async () => {
    const query = `SELECT irysId FROM users ORDER BY irysId DESC LIMIT 1`;
    const [rows] = await dbPool.execute(query);
    let counter = 0;
    if (rows.length > 0) {
        const lastIrysId = rows[0].irysId;
        const match = lastIrysId.match(/^(\d+)\.irys$/);

        if (match && match[1]) {
            counter = parseInt(match[1]) + 1;
        }
    }
    const numericPart = counter.toString().padStart(6, '0');
    return `${numericPart}.irys`;
};

const userRegister = async (body) => {
    const { name, regisData, address } = body;
    const hashData = await bcrypt.hash(regisData, 10)
    const irysId = await generateIrysId();
    const SQLQuery = `INSERT INTO users (name, regisData, address, irysId) 
                      VALUES (?, ?, ?, ?)`;
    const [result] = await dbPool.execute(SQLQuery, [name, hashData, address, irysId]);
    return {
        ...result,
        generatedIrysId: irysId
    };
};

const userActivityRegister = async (irysId) => {
    const SQLQuery = `INSERT INTO user_activity (user_irysId, activityType, activityDate) 
                      VALUES (?, 'register', CURDATE())`;
    const [result] = await dbPool.execute(SQLQuery, [irysId]);
    return {
        ...result,
    }
};

const requestLogin = async (name) => {
    const SQLQuery = `SELECT name, address, irysId FROM users WHERE name = ?`;
    const [result] = await dbPool.execute(SQLQuery, [name]);
    return result[0];
};

const userLogin = async (name) => {
    const SQLQuery = `SELECT name, regisData, address, irysId, evmVerified, aboutMe, profilUrl,
        evmAddress, irysAddress, x, discord, irysMail, irysGit, role FROM users WHERE name = ?`;
    const [result] = await dbPool.execute(SQLQuery, [name]);
    return result[0];
};

const userUpdateData = async (irysId, updateFields) => {
    const fieldsToUpdate = [];
    const values = [];
    const allowedFields = ['name', 'regisData', 'address', 'aboutMe', 'profilUrl',
        'evmAddress', 'irysAddress', 'x', 'discord', 'irysMail', 'irysGit'];
    for (const [key, value] of Object.entries(updateFields)) {
        if (allowedFields.includes(key)) {
            if (value === undefined) {
                console.warn(`[WARNING] Field "${key}" has undefined value. Skipping...`);
                continue;
            };

            fieldsToUpdate.push(`${key} = ?`);

            values.push(value);
        }
    }
    if (fieldsToUpdate.length === 0) {
        return { message: "No fields to update" };
    }

    const SQLQuery = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE irysId = ?`;
    values.push(irysId);
    console.log("Executing SQL:", SQLQuery);
    console.log("With values:", values);
    try {
        const [result] = await dbPool.execute(SQLQuery, values);
        return {
            ...result,
        };
    } catch (error) {
        console.error("Database update error:", error.message);
        throw error;
    }
};

const userPromotion = async (irysId, updateFields) => {
    const fieldsToUpdate = [];
    const values = [];
    const allowedFields = ['role'];
    for (const [key, value] of Object.entries(updateFields)) {
        if (allowedFields.includes(key) && value !== undefined && value !== null) {
            fieldsToUpdate.push(`${key} = ?`);
            values.push(value);
        };
    };
    if (fieldsToUpdate.length === 0) {
        return { message: "No fields to update" };
    };

    const SQLQuery = `UPDATE users SET ${fieldsToUpdate.join(', ')} WHERE irysId = ?`;
    values.push(irysId);
    console.log("Executing SQL:", SQLQuery);
    console.log("With values:", values);
    const [result] = await dbPool.execute(SQLQuery, values);
    return {
        ...result,
    };
};

const userActivityLogin = async (irysId) => {
    const SQLQuery = `INSERT INTO user_activity (user_irysId, activityType, activityDate) 
                      VALUES (?, 'login', CURDATE())`
    const [result] = await dbPool.execute(SQLQuery, [irysId]);
    return {
        ...result,
    };
};

const deleteUser = async (irysId) => {
    const deleteActivityQuery = `DELETE FROM user_activity WHERE user_irysId = ?`;
    await dbPool.execute(deleteActivityQuery, [irysId]);
    const deleteUsersQuery = `DELETE FROM users WHERE irysId = ?`;
    const [result] = await dbPool.execute(deleteUsersQuery, [irysId]);
    return result;
};

const userId = async (irysId) => {
    const SQLQuery = `SELECT name, regisData, address, irysId, aboutMe, profilUrl,
        evmAddress, irysAddress, x, discord, irysMail, irysGit, role FROM users WHERE irysId = ?`;
    const [result] = await dbPool.execute(SQLQuery, [irysId]);
    return result[0];
};

const requestAllUsers = async () => { 
    const SQLQuery = `SELECT name, irysId, role, aboutMe, profilUrl,
        evmAddress, irysAddress, x, discord, irysMail, irysGit FROM users`;
    const [result] = await dbPool.execute(SQLQuery);
    return result; 
};

const getUserCollections = async (irysId) => {
    const SQLQuery = `SELECT user_irysId, imageId, imageUserId, imageName FROM user_collections WHERE user_irysId = ?`;
    const [result] = await dbPool.execute(SQLQuery, [irysId]);
    return result;
};

const cekUserExist = async (irysId) => {
    const SQLQuery = `SELECT irysId FROM users WHERE irysId = ?`;
    const [result] = await dbPool.execute(SQLQuery, [irysId]);
    return result.length > 0;
};

const cekUserAddress = async (irysId) => {
    const SQLQuery = `SELECT evmAddress FROM users WHERE irysId = ?`;
    const [result] = await dbPool.execute(SQLQuery, [irysId]);
    return result[0]; 
};

const updateUserEvmAddress = async (irysId, evmAddress, irysAddress) => {
    const SQLQuery = `
        UPDATE users 
        SET evmAddress = ?, 
            evmVerified = TRUE, 
            irysAddress = ? 
        WHERE irysId = ?
    `;
    const [result] = await dbPool.execute(SQLQuery, [evmAddress, irysAddress, irysId]);
    return result;
};

const userFile = async (body) => {
    const { irysId, irysAddress, fileName, fileUrl, fileType, fileSize, transactionId, date } = body;
    const SQLQuery = `
        INSERT INTO user_irys_storage (irysId, irysAddress, file)
        VALUES (?, ?, JSON_ARRAY(JSON_OBJECT('name', ?, 'Url', ?, 'type', ?, 'size', ?, 'id', ?, 'date', ?)))
        ON DUPLICATE KEY UPDATE
            file = JSON_ARRAY_APPEND(file, '$', JSON_OBJECT('name', ?, 'Url', ?, 'type', ?, 'size', ?, 'id', ?, 'date', ?))
    `;
    const [result] = await dbPool.execute(SQLQuery, [
        irysId,
        irysAddress,
        fileName, fileUrl, fileType, fileSize, transactionId, date, 
        fileName, fileUrl, fileType, fileSize, transactionId, date
    ]);
    return result;
};

const searchUserFile = async (irysId) => {
    const SQLQuery = `SELECT file FROM user_irys_storage WHERE irysId = ?`;
    const [result] = await dbPool.execute(SQLQuery, [irysId]);
    return result[0];
};

export {
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
};