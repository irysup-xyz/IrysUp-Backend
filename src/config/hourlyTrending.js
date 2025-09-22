import { dbPool } from './dbPoolConfig.js';

export const calculateHourlyTrending = async () => {
    const connection = await dbPool.getConnection();
    try {
        console.log("[HOURLY TRENDING] Start calculating hourly trending images...");

        const [currentImages] = await connection.query(`
      SELECT imageId, imageName, creator_irysId, imageStar AS starCount
      FROM images
      WHERE imageStar > 0
    `);

        if (currentImages.length === 0) {
            console.log("[HOURLY TRENDING] No images with stars.");
            return;
        }

        const now = new Date();
        const periodDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
        const periodDateStr = periodDate.toISOString().slice(0, 19).replace('T', ' ');

        const insertHistory = currentImages.map(row => [
            row.imageId,
            row.starCount,
            periodDateStr
        ]);

        await connection.query(
            `INSERT INTO image_star_history (imageId, starCount, recordedAt) VALUES ?`,
            [insertHistory]
        );

        const oneHourAgo = new Date(periodDate.getTime() - 60 * 60 * 1000);
        const oneHourAgoStr = oneHourAgo.toISOString().slice(0, 19).replace('T', ' ');

        const [previousData] = await connection.query(`
      SELECT imageId, starCount
      FROM image_star_history
      WHERE recordedAt >= ? AND recordedAt < ?
      ORDER BY recordedAt DESC
    `, [oneHourAgoStr, periodDateStr]);

        const prevMap = {};
        for (const row of previousData) {
            if (!prevMap[row.imageId]) {
                prevMap[row.imageId] = row.starCount;
            }
        }

        const trendingData = currentImages
            .map(row => {
                const prevStars = prevMap[row.imageId] || 0;
                const increase = row.starCount - prevStars;
                const percentIncrease = prevStars > 0 ? ((increase / prevStars) * 100) : 0;

                return {
                    imageId: row.imageId,
                    imageName: row.imageName,
                    creator_irysId: row.creator_irysId,
                    currentStarCount: row.starCount,
                    prevStarCount: prevStars,
                    increase: increase,
                    percentIncrease: Math.round(percentIncrease * 100) / 100
                };
            })
            .filter(item => item.increase > 0)
            .sort((a, b) => b.percentIncrease - a.percentIncrease)
            .slice(0, 50);

        if (trendingData.length === 0) {
            console.log("[HOURLY TRENDING] No images increased in the last hour.");
            return;
        }

        const insertData = trendingData.map((item, index) => [
            item.imageId,
            item.imageName,
            item.creator_irysId,
            item.currentStarCount,
            'hourly',
            periodDateStr,
            index + 1,
            item.prevStarCount,
            item.increase,
            item.percentIncrease
        ]);

        const insertQuery = `
      INSERT INTO trending_images (
        imageId, imageName, creator_irysId, starCount,
        periodType, periodDate, rankPosition,
        prevStarCount, increase, percentIncrease
      ) VALUES ?
    `;

        await connection.query(insertQuery, [insertData]);

        console.log(`[HOURLY TRENDING] Successfully saved ${trendingData.length} hourly trending images.`);

    } catch (error) {
        console.error("[HOURLY TRENDING] Error:", error);
    } finally {
        connection.release();
    }
};