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
exports.getCurrentFine = exports.renewBook = exports.returnBook = exports.issueBook = void 0;
const IssueTransaction_model_1 = require("../models/IssueTransaction.model");
const Student_model_1 = require("../models/Student.model");
const Book_model_1 = require("../models/Book.model");
const errorHandler_1 = require("../utils/errorHandler");
const fine_service_1 = require("./fine.service");
const email_service_1 = require("./email.service");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const MAX_ISSUE_DAYS = parseInt(process.env.MAX_ISSUE_DAYS || '15');
const MS_PER_DAY = 1000 * 60 * 60 * 24;
const issueBook = async (student_id, book_id) => {
    const student = await Student_model_1.Student.findByPk(student_id);
    const book = await Book_model_1.Book.findByPk(book_id);
    if (!student) {
        throw new errorHandler_1.ApiError('Student not found.', 404);
    }
    if (!book) {
        throw new errorHandler_1.ApiError('Book not found.', 404);
    }
    if (book.available_copies <= 0) {
        throw new errorHandler_1.ApiError(`Book "${book.title}" is currently unavailable.`, 400);
    }
    const existingIssue = await IssueTransaction_model_1.IssueTransaction.findOne({
        where: { student_id, book_id, is_returned: false },
    });
    if (existingIssue) {
        throw new errorHandler_1.ApiError('Student already has an unreturned copy of this book.', 400);
    }
    const issue_date = new Date();
    const due_date = new Date(issue_date.getTime() + MAX_ISSUE_DAYS * 24 * 60 * 60 * 1000);
    const transaction = await IssueTransaction_model_1.IssueTransaction.create({
        student_id,
        book_id,
        issue_date,
        due_date,
        fine_amount: 0,
        is_returned: false
    });
    await book.update({ available_copies: book.available_copies - 1 });
    await (0, email_service_1.sendIssueConfirmation)(student, book, due_date);
    return transaction;
};
exports.issueBook = issueBook;
const returnBook = async (transaction_id) => {
    const transaction = await IssueTransaction_model_1.IssueTransaction.findByPk(transaction_id, {
        include: [Student_model_1.Student, Book_model_1.Book]
    });
    if (!transaction) {
        throw new errorHandler_1.ApiError('Transaction record not found.', 404);
    }
    if (transaction.is_returned) {
        throw new errorHandler_1.ApiError('This book is already returned.', 400);
    }
    const returnDate = new Date();
    const fine = (0, fine_service_1.calculateFine)(transaction.due_date, returnDate);
    await transaction.update({
        return_date: returnDate,
        fine_amount: fine,
        is_returned: true
    });
    const student = transaction.get(Student_model_1.Student.name);
    await student.update({ total_fines_due: student.total_fines_due + fine });
    const book = transaction.get(Book_model_1.Book.name);
    if (book) {
        await book.update({ available_copies: book.available_copies + 1 });
    }
    return transaction;
};
exports.returnBook = returnBook;
const renewBook = async (transaction_id) => {
    const transaction = await IssueTransaction_model_1.IssueTransaction.findByPk(transaction_id);
    if (!transaction) {
        throw new errorHandler_1.ApiError('Transaction record not found.', 404);
    }
    if (transaction.is_returned) {
        throw new errorHandler_1.ApiError('Cannot renew a returned book.', 400);
    }
    const today = new Date();
    if (today.getTime() > transaction.due_date.getTime()) {
        const fineDue = (0, fine_service_1.calculateFine)(transaction.due_date, today);
        throw new errorHandler_1.ApiError(`Book is overdue. Please return the book or clear the current fine of Rs.${fineDue.toFixed(2)} to renew.`, 400);
    }
    const newDueDate = new Date(today.getTime() + MAX_ISSUE_DAYS * 24 * 60 * 60 * 1000);
    await transaction.update({
        due_date: newDueDate
    });
    return transaction;
};
exports.renewBook = renewBook;
const getCurrentFine = async (transaction_id) => {
    const transaction = await IssueTransaction_model_1.IssueTransaction.findByPk(transaction_id);
    if (!transaction) {
        throw new errorHandler_1.ApiError('Transaction record not found.', 404);
    }
    if (transaction.is_returned) {
        return { fine: transaction.fine_amount, status: 'Finalized Fine' };
    }
    const today = new Date();
    const fine = (0, fine_service_1.calculateFine)(transaction.due_date, today);
    return {
        fine: fine,
        status: fine > 0 ? `Overdue by ${Math.ceil((today.getTime() - transaction.due_date.getTime()) / MS_PER_DAY)} days` : 'Not Overdue'
    };
};
exports.getCurrentFine = getCurrentFine;
