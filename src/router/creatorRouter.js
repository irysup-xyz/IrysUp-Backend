import express from 'express';
import {
    registerCreator,
    successRegist,
    getAllRegist
} from '../controller/creatorController.js'

const routerCreator = express.Router();

routerCreator.post('/register', registerCreator);
routerCreator.post('/success', successRegist);
routerCreator.get('/all', getAllRegist);

export {
    routerCreator
};