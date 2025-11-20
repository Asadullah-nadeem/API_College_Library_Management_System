import express from 'express';
import * as dotenv from 'dotenv';
import { setupServer } from './config/server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

setupServer(app);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`API Server listening on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});