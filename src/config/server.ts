import express, { Express } from 'express';
import '../models/Student.model';
import '../models/Book.model';
import '../models/IssueTransaction.model';
import cors from 'cors';
import { connectDB } from './database';
import studentRoutes from '../routes/student.routes';
import bookRoutes from '../routes/book.routes';
import transactionRoutes from '../routes/transaction.routes';
import { errorHandler } from '../utils/errorHandler';

export function setupServer(app: Express): Express {

    connectDB();
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.get('/', (req, res) => {
        res.status(200).json({
            message: 'Welcome to College Library Management System API',
            status: 'Running'
        });
    });

    app.use('/api/students', studentRoutes);
    app.use('/api/books', bookRoutes);
    app.use('/api/transactions', transactionRoutes);

    app.use(errorHandler);

    return app;
}