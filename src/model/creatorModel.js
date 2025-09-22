
import { dbPool } from '../config/dbPoolConfig.js';

const creatorRegister = async (body) => {
    const { name, irysId, link } = body;
    const SQLQuery = `INSERT INTO user_become_creator (name, irysId, link) 
                      VALUES (?, ?, ?)`;
    const [result] = await dbPool.execute(SQLQuery, [name, irysId, link]);
    return {
        ...result,
        generatedIrysId: irysId
    };
};

const registSuccess = async (body) => {
    const { irysId } = body;
    const SQLQuery = `DELETE FROM user_become_creator WHERE irysId = ?`
    const [result] = await dbPool.execute(SQLQuery, [irysId]);
    return result[0];
};

const getAllCreators = async () => {
    const SQLQuery = `SELECT * FROM user_become_creator`;
    const [rows] = await dbPool.execute(SQLQuery);
    return rows; 
};

export {
    creatorRegister,
    registSuccess,
    getAllCreators
}