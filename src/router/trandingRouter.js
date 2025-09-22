import express from 'express';
import { getDailyTrending, getWeeklyTrending, getHourlyTrending, getHistoryTrending } from '../controller/trendingController.js';
import verifyTokenHeader from '../middleware/verifyTokenHeader.js';

const routerTrending = express.Router();

routerTrending.get('/daily', getDailyTrending);
routerTrending.get('/weekly',verifyTokenHeader, getWeeklyTrending);
routerTrending.get('/hourly', getHourlyTrending);
routerTrending.get('/history/:periodType', getHistoryTrending);
export {
  routerTrending
};