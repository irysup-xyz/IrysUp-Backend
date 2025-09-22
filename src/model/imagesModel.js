import { dbPool } from '../config/dbPoolConfig.js';

const uploadImages = async (body) => {
    const { imageName, imageData, creator_name, creator_irysId } = body;
    const SQLQuery = `INSERT INTO images (imageName, imageData, creator_name, creator_irysId)
                      VALUES (?, ?, ?, ?)`;
    const [result] = await dbPool.execute(SQLQuery, [imageName, imageData, creator_name, creator_irysId]);
    return {
        ...result,
    };
};

const searchImages = async (filters) => {
    const conditions = [];
    const values = [];

    if (filters.imageName) {
        conditions.push('imageName = ?');
        values.push(filters.imageName);
    };
    if (filters.creator_name) {
        conditions.push('creator_name = ?');
        values.push(filters.creator_name);
    };
    if (filters.creator_irysId) {
        conditions.push('creator_irysId = ?');
        values.push(filters.creator_irysId);
    };

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const SQLQuery = `SELECT imageId, imageName, imageData, imageStar, creator_name, creator_irysId 
                     FROM images ${whereClause}`;

    const [rows] = await dbPool.execute(SQLQuery, values);
    return {
        ...rows,
    };
};

const deleteImages = async (imageName) => {
    const SQLQuery = `DELETE FROM images WHERE imageName = ?`
    const [result] = await dbPool.execute(SQLQuery, [imageName]);
    return result[0];
};

const stars = async (imageId) => {
    const SQLQuery = `UPDATE images SET imageStar = imageStar + 1 WHERE imageId = ?`;
    const [result] = await dbPool.execute(SQLQuery, [imageId]);
    return result;
};

const useImage = async (body) => {
    const { user_irysId, imageId, imageUserId, imageName } = body;
    const starResult = await stars(imageId);
    const SQLQuery = `INSERT INTO user_collections (user_irysId, imageId, imageUserId, imageName)
                      VALUES(?, ?, ?, ?)`;
    const [collectionResult] = await dbPool.execute(SQLQuery, [user_irysId, imageId, imageUserId, imageName]);
    return {
        starUpdate: starResult,
        collectionInsert: collectionResult
    };
};

export {
    uploadImages,
    searchImages,
    deleteImages,
    useImage
}