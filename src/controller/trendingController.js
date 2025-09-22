import { getTrendingByPeriod, getTrendingHistory } from '../model/trendingModel.js';

const formatDateToHourStart = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), 0, 0, 0)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
};

const getMondayOfCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMonday);
    return monday.toISOString().split('T')[0];
};

const sendNotFoundResponse = (res, periodType) => {
    const messages = {
        daily: "No daily trending data for this period.",
        weekly: "No weekly trending data for this period.",
        hourly: "No hourly trending data for this period.",
    };

    return res.status(404).json({
        success: false,
        message: messages[periodType] || "Data not found.",
        data: [],
    });
};

const sendErrorResponse = (res, error, defaultMessage) => {
    console.error(`[API] Error ${defaultMessage}:`, error);
    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message,
    });
};

export const getDailyTrending = async (req, res) => {
    try {
        const { date } = req.query;
        const periodDate = date || new Date().toISOString().split('T')[0];
        const periodType = 'daily';

        const rows = await getTrendingByPeriod(periodType, periodDate);

        if (rows.length === 0) {
            return sendNotFoundResponse(res, periodType);
        }

        res.json({
            success: true,
            periodType,
            periodDate,
            count: rows.length,
            data: rows,
        });
    } catch (error) {
        sendErrorResponse(res, error, "Failed to fetch daily trending data.");
    }
};

export const getWeeklyTrending = async (req, res) => {
    try {
        const { date } = req.query;
        const periodDate = date || getMondayOfCurrentWeek();
        const periodType = 'weekly';

        const rows = await getTrendingByPeriod(periodType, periodDate);

        if (rows.length === 0) {
            return sendNotFoundResponse(res, periodType);
        }

        res.json({
            success: true,
            periodType,
            periodDate,
            count: rows.length,
            data: rows,
        });
    } catch (error) {
        sendErrorResponse(res, error, "Failed to fetch weekly trending data.");
    }
};

export const getHourlyTrending = async (req, res) => {
    try {
        const { date } = req.query;
        let periodDate;

        if (date) {
            const regex = /^\d{4}-\d{2}-\d{2}\s\d{2}:00:00$/;
            if (!regex.test(date)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format. Use: YYYY-MM-DD HH:00:00",
                });
            }
            periodDate = date;
        } else {
            periodDate = formatDateToHourStart(new Date());
        }

        const periodType = 'hourly';
        const rows = await getTrendingByPeriod(periodType, periodDate);

        if (rows.length === 0) {
            return sendNotFoundResponse(res, periodType);
        }

        res.json({
            success: true,
            periodType,
            periodDate,
            count: rows.length,
            data: rows,
        });
    } catch (error) {
        sendErrorResponse(res, error, "Failed to fetch hourly trending data.");
    }
};

export const getHistoryTrending = async (req, res) => {
    try {
        const { periodType } = req.params;
        const { startDate, endDate } = req.query;

        const validPeriodTypes = ['daily', 'weekly', 'hourly'];
        if (!validPeriodTypes.includes(periodType)) {
            return res.status(400).json({
                success: false,
                message: `periodType must be one of: ${validPeriodTypes.join(', ')}`,
            });
        }

        const rows = await getTrendingHistory(periodType, startDate, endDate);

        if (rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: `No trending history data for period ${periodType}.`,
                data: [],
            });
        }

        const grouped = rows.reduce((acc, row) => {
            const date = row.periodDate.toISOString().slice(0, 19).replace('T', ' ');
            if (!acc[date]) acc[date] = [];
            acc[date].push({
                imageId: row.imageId,
                imageName: row.imageName,
                creator_irysId: row.creator_irysId,
                starCount: row.starCount,
                rankPosition: row.rankPosition,
                growthRate: row.percentIncrease !== undefined ? parseFloat(row.percentIncrease) : null,
            });
            return acc;
        }, {});

        const result = Object.keys(grouped).map(periodDate => ({
            periodDate,
            data: grouped[periodDate],
        }));

        res.json({
            success: true,
            periodType,
            count: rows.length,
            periods: result.length,
            data: result,
        });

    } catch (error) {
        sendErrorResponse(res, error, "Failed to fetch trending history.");
    }
};