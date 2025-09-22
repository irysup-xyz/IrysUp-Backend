import { dbPool } from '../config/dbPoolConfig.js';

export const getUserActivityByUser = async (irysId) => {
  const query = `
    SELECT 
      activityId,
      user_irysId,
      activityType,
      activityDate,
      created_at
    FROM user_activity
    WHERE user_irysId = ?
    ORDER BY created_at DESC
  `;
  const [rows] = await dbPool.query(query, [irysId]);
  return rows;
};

export const getAllUserActivity = async (limit = 50, offset = 0) => {
  const query = `
    SELECT 
      ua.activityId,
      ua.user_irysId,
      ua.activityType,
      ua.activityDate,
      ua.created_at
    FROM user_activity ua
    LEFT JOIN users u ON ua.user_irysId = u.irysId
    ORDER BY ua.created_at DESC
    LIMIT ? OFFSET ?
  `;
  const [rows] = await dbPool.query(query, [limit, offset]);
  return rows;
};

export const getTotalActivityCount = async () => {
  const [rows] = await dbPool.query(`SELECT COUNT(*) as total FROM user_activity`);
  return rows[0].total;
};

export const getActivitySummaryByDate = async (startDate = null, endDate = null, limit = 30) => {
  let query = `
    SELECT 
      activityDate,
      SUM(CASE WHEN activityType = 'register' THEN 1 ELSE 0 END) as registerCount,
      SUM(CASE WHEN activityType = 'login' THEN 1 ELSE 0 END) as loginCount,
      COUNT(*) as totalActivity
    FROM user_activity
  `;

  const params = [];
  if (startDate && endDate) {
    query += ` WHERE activityDate BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  } else if (startDate) {
    query += ` WHERE activityDate >= ?`;
    params.push(startDate);
  } else if (endDate) {
    query += ` WHERE activityDate <= ?`;
    params.push(endDate);
  }

  query += ` GROUP BY activityDate ORDER BY activityDate DESC LIMIT ?`;
  params.push(limit);

  const [rows] = await dbPool.query(query, params);
  return rows;
};