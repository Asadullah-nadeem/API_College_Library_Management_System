import { Request, Response, NextFunction } from 'express';
import * as transactionService from '../services/transaction.service';
import { ApiError } from '../utils/errorHandler';

type ExpressAsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: ExpressAsyncHandler) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };


export const issueBook = asyncHandler(async (req, res) => {
    const { student_id, book_id } = req.body;

    if (!student_id || !book_id) {
        throw new ApiError('Student ID and Book ID are required for issue.', 400);
    }

    const transaction = await transactionService.issueBook(student_id, book_id);
    res.status(201).json({ success: true, message: 'Book issued successfully. Email notification sent.', data: transaction });
});


export const returnBook = asyncHandler(async (req, res) => {
    const transaction_id = parseInt(req.params.id);

    if (isNaN(transaction_id)) {
        throw new ApiError('Invalid Transaction ID.', 400);
    }

    const transaction = await transactionService.returnBook(transaction_id);

    let message = 'Book returned successfully.';
    if (transaction.fine_amount > 0) {
        message += ` A fine of Rs.${transaction.fine_amount.toFixed(2)} was calculated.`;
    }

    res.status(200).json({ success: true, message, data: transaction });
});


export const renewBook = asyncHandler(async (req, res) => {
    const transaction_id = parseInt(req.params.id);

    if (isNaN(transaction_id)) {
        throw new ApiError('Invalid Transaction ID.', 400);
    }

    const transaction = await transactionService.renewBook(transaction_id);
    res.status(200).json({
        success: true,
        message: `Book renewed successfully. New due date is ${transaction.due_date.toDateString()}`,
        data: transaction
    });
});

export const calculateFine = asyncHandler(async (req, res) => {
    const transaction_id = parseInt(req.params.id);

    if (isNaN(transaction_id)) {
        throw new ApiError('Invalid Transaction ID.', 400);
    }

    const fineDetails = await transactionService.getCurrentFine(transaction_id);

    res.status(200).json({
        success: true,
        message: `Current fine calculation for transaction ${transaction_id}.`,
        data: fineDetails
    });
});