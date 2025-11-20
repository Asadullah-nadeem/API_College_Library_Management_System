"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateFine = exports.renewBook = exports.returnBook = exports.issueBook = void 0;
const transactionService = __importStar(require("../services/transaction.service"));
const errorHandler_1 = require("../utils/errorHandler");
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.issueBook = asyncHandler(async (req, res) => {
    const { student_id, book_id } = req.body;
    if (!student_id || !book_id) {
        throw new errorHandler_1.ApiError('Student ID and Book ID are required for issue.', 400);
    }
    const transaction = await transactionService.issueBook(student_id, book_id);
    res.status(201).json({ success: true, message: 'Book issued successfully. Email notification sent.', data: transaction });
});
exports.returnBook = asyncHandler(async (req, res) => {
    const transaction_id = parseInt(req.params.id);
    if (isNaN(transaction_id)) {
        throw new errorHandler_1.ApiError('Invalid Transaction ID.', 400);
    }
    const transaction = await transactionService.returnBook(transaction_id);
    let message = 'Book returned successfully.';
    if (transaction.fine_amount > 0) {
        message += ` A fine of Rs.${transaction.fine_amount.toFixed(2)} was calculated.`;
    }
    res.status(200).json({ success: true, message, data: transaction });
});
exports.renewBook = asyncHandler(async (req, res) => {
    const transaction_id = parseInt(req.params.id);
    if (isNaN(transaction_id)) {
        throw new errorHandler_1.ApiError('Invalid Transaction ID.', 400);
    }
    const transaction = await transactionService.renewBook(transaction_id);
    res.status(200).json({
        success: true,
        message: `Book renewed successfully. New due date is ${transaction.due_date.toDateString()}`,
        data: transaction
    });
});
exports.calculateFine = asyncHandler(async (req, res) => {
    const transaction_id = parseInt(req.params.id);
    if (isNaN(transaction_id)) {
        throw new errorHandler_1.ApiError('Invalid Transaction ID.', 400);
    }
    const fineDetails = await transactionService.getCurrentFine(transaction_id);
    res.status(200).json({
        success: true,
        message: `Current fine calculation for transaction ${transaction_id}.`,
        data: fineDetails
    });
});
