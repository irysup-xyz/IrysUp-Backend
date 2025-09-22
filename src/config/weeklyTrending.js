import { dbPool } from "./dbPoolConfig.js";

export const calculateWeeklyTrending = async () => {
    const connection = await dbPool.getConnection();
    try {
        console.log("[WEEKLY TRENDING] Start calculating this week's trending images...");

        const [rows] = await connection.query(`
      SELECT imageId, imageName, creator_irysId, imageStar AS starCount
      FROM images 
      ORDER BY imageStar DESC 
      LIMIT 50 
    `);

        if (rows.length === 0) {
            console.log("[WEEKLY TRENDING] No images found.");
            return;
        }

        const today = new Date();
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diffToMonday);
        const mondayStr = monday.toISOString().split('T')[0];

        const insertData = rows.map((row, index) => [
            row.imageId,
            row.imageName,
            row.creator_irysId,
            row.starCount,
            'weekly',
            mondayStr,
            index + 1,
            null,
            null,
            null
        ]);

        const insertQuery = `
      INSERT INTO trending_images (
        imageId, imageName, creator_irysId, starCount,
        periodType, periodDate, rankPosition,
        prevStarCount, increase, percentIncrease
      ) VALUES ?
    `;

        await connection.query(insertQuery, [insertData]);

        console.log(`[WEEKLY TRENDING] Successfully saved ${rows.length} this week's trending images.`);
    } catch (error) {
        console.error("[WEEKLY TRENDING] Error:", error);
    } finally {
        connection.release();
    }
};