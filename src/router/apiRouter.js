import { Router } from 'express';
import { routerUser } from './userRouter.js';
import { routerImgCreator } from './creatorImgRouter.js';
import { routerTrending } from './trandingRouter.js';
import { routerUserActivity } from './userActivityRoutes.js';
import {routerCreator} from './creatorRouter.js';

const apiRouter = Router();

apiRouter.use('/user', routerUser);           
apiRouter.use('/creator', routerImgCreator);  
apiRouter.use('/trending', routerTrending);   
apiRouter.use('/user-activity', routerUserActivity);   
apiRouter.use('/irysup', routerCreator);   

export {
    apiRouter
};