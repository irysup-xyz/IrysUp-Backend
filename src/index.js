import express from 'express';
import dotenv from 'dotenv';
import {apiRouter} from './router/apiRouter.js';
import cors from 'cors';

dotenv.config();
const PORT = process.env.PORT;
const app = express();

app.use(cors({
    origin: [
        'https://irysup.xyz'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use('/', apiRouter);
app.use('/public', express.static('public'));

app.listen(PORT, () => {
    console.log('Server start');
    console.log(`http://localhost:${PORT}`);
});