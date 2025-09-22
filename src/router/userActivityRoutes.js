import express from 'express';
import { getUserActivity, getAllActivity, getActivitySummary } from '../controller/userActivityController.js';

const routerUserActivity = express.Router();

routerUserActivity.get('/me',  getUserActivity);
routerUserActivity.get('/',   getAllActivity);
routerUserActivity.get('/summary',  getActivitySummary);

export { routerUserActivity};