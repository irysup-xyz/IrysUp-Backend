import { dbPool } from './config/dbPoolConfig.js';
import { calculateDailyTrending } from './config/dailyTrending.js';
import { calculateWeeklyTrending } from './config/weeklyTrending.js';
import { calculateHourlyTrending } from './config/hourlyTrending.js';
import cron from 'node-cron';

console.log("🚀 Cron scheduler started...");

cron.schedule('0 * * * *', async () => {
    console.log("⏰ Running hourly task: Calculate hourly trending...");
    await calculateHourlyTrending();
});

cron.schedule('0 0 * * *', async () => {
    console.log("⏰ Running daily task: Calculate daily trending...");
    await calculateDailyTrending();
});

cron.schedule('0 0 * * 1', async () => {
    console.log("📅 Running weekly task: Calculate weekly trending...");
    await calculateWeeklyTrending();
});

cron.schedule('0 1 * * *', async () => {
    const connection = await dbPool.getConnection();
    try {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const cutoffStr = cutoff.toISOString().slice(0, 19).replace('T', ' ');
        await connection.query(
            'DELETE FROM image_star_history WHERE recordedAt < ?',
            [cutoffStr]
        );
        console.log(`🧹 Cleaning up old star history (>30 days): ${cutoffStr}`);
    } catch (error) {
        console.error("[CLEANUP] Error:", error);
    } finally {
        connection.release();
    }
});