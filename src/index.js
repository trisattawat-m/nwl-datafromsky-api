import express, { json } from 'express';
import getData from './services/get-data.js';
import dotenv from 'dotenv';

const app = express();

const PORT = process.env.PORT || 3000;

dotenv.config();

app.use(json());

app.get('/api/datafromsky', getData);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});