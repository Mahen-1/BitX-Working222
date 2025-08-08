// backend/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import generateRoute from './routes/generate-app.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/generate-app', generateRoute);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🟢 Backend running at http://localhost:${PORT}`);
});
