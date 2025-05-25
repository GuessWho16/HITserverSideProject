import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();


import aboutRouter from './routes/about.js';
import costsRouter from './routes/costs.js';
import usersRouter from './routes/users.js';

const app = express();

app.use(express.json());

app.use('/api/about',aboutRouter);
app.use('/api/add',costsRouter);
app.use('/api/report',costsRouter);
app.use('/api/users',usersRouter);

mongoose.connect(process.env.DB_MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(error => console.error('Mongo ERROR:',error));

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});