import express from 'express';
import * as dotenv from 'dotenv';
import logger from './utils/logger';
import { setupServer } from './config/server';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

setupServer(app);

// Start the server
function startApp() {
    try {
        logger.info('Application started successfully');
        logger.debug('This is a debug message, only visible in development');
        throw new Error('Something went wrong during operation');

    } catch (error: any) {
        logger.error('An unhandled error occurred', {
            message: error.message,
            stack: error.stack,
            additionalInfo: 'example context data'
        });
    }
}
startApp();

app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`API Server listening on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});