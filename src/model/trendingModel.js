import { dbPool } from '../config/dbPoolConfig.js';

export const getTrendingByPeriod = async (periodType, periodDate) => {
    const query = `
    SELECT 
      imageId, 
      imageName, 
      creator_irysId, 
      starCount, 
      rankPosition
      ${periodType === 'hourly' ? `prevStarCount, increase, percentIncrease` : ``}
    FROM trending_images 
    WHERE periodType = ? AND periodDate = ?
    ORDER BY rankPosition ASC
  `;

    const [rows] = await dbPool.query(query, [periodType, periodDate]);
    return rows;
};

export const getTrendingHistory = async (periodType, startDate = null, endDate = null) => {
    let query = `
        SELECT 
            periodDate,
            imageId, 
            imageName, 
            creator_irysId, 
            starCount, 
            rankPosition
            ${periodType === 'hourly' ? `, prevStarCount, increase, percentIncrease` : ``}
        FROM trending_images 
        WHERE periodType = ?
    `;

    const params = [periodType];

    if (startDate && endDate) {
        query += ` AND periodDate BETWEEN ? AND ?`;
        params.push(startDate, endDate);
    } else if (startDate) {
        query += ` AND periodDate >= ?`;
        params.push(startDate);
    } else if (endDate) {
        query += ` AND periodDate <= ?`;
        params.push(endDate);
    }

    query += ` ORDER BY periodDate DESC, rankPosition ASC`;

    const [rows] = await dbPool.query(query, params);
    return rows;
};