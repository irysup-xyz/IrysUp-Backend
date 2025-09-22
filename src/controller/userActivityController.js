import {
    getUserActivityByUser,
    getAllUserActivity,
    getTotalActivityCount,
    getActivitySummaryByDate
} from '../model/userActivityModel.js';

const sendErrorResponse = (res, error, defaultMessage) => {
    console.error(`[UserActivity] Error:`, error);
    return res.status(500).json({
        success: false,
        message: defaultMessage,
        error: error.message,
    });
};

export const getUserActivity = async (req, res) => {
    try {
        let irysId = req.query.irysId || req.headers['x-user-irysid'];

        if (!irysId) {
            return res.status(400).json({
                success: false,
                message: 'irysId parameter is required. Example: ?irysId=user_abc',
            });
        }

        const activities = await getUserActivityByUser(irysId);

        res.json({
            success: true,
            count: activities.length,
             activities,
        });
    } catch (error) {
        sendErrorResponse(res, error, 'Failed to fetch user activity.');
    }
};

export const getAllActivity = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const activities = await getAllUserActivity(limit, offset);
        const total = await getTotalActivityCount();
        const totalPages = Math.ceil(total / limit);

        res.json({
            success: true,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
             activities,
        });
    } catch (error) {
        sendErrorResponse(res, error, 'Failed to fetch all activities.');
    }
};

export const getActivitySummary = async (req, res) => {
    try {
        const { startDate, endDate, limit = 30 } = req.query;

        const summary = await getActivitySummaryByDate(startDate, endDate, parseInt(limit));

        res.json({
            success: true,
            count: summary.length,
             summary,
        });
    } catch (error) {
        sendErrorResponse(res, error, 'Failed to fetch daily activity summary.');
    }
};