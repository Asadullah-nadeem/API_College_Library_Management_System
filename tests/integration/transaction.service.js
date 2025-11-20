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
const transactionService = __importStar(require("../../src/services/transaction.service"));
const errorHandler_1 = require("../../src/utils/errorHandler");
const Student_model_1 = require("../../src/models/Student.model");
const Book_model_1 = require("../../src/models/Book.model");
const IssueTransaction_model_1 = require("../../src/models/IssueTransaction.model");
const emailService = __importStar(require("../../src/services/email.service"));
jest.mock('../../src/models/Student.model');
jest.mock('../../src/models/Book.model');
jest.mock('../../src/models/IssueTransaction.model');
jest.mock('../../src/services/email.service');
const mockStudent = {
    student_id: 'C001',
    name: 'Test Student',
    email: 'test@example.com',
    total_fines_due: 0,
    update: jest.fn().mockResolvedValue(true),
};
const mockBook = {
    book_id: 'B001',
    title: 'Test Book',
    author: 'Author',
    available_copies: 5,
    total_copies: 10,
    update: jest.fn().mockResolvedValue(true),
};
const mockTransaction = {
    id: 1,
    student_id: 'C001',
    book_id: 'B001',
    issue_date: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000),
    due_date: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
    fine_amount: 0,
    is_returned: false,
    update: jest.fn().mockResolvedValue(true),
    get: jest.fn((modelName) => {
        if (modelName === Student_model_1.Student.name)
            return mockStudent;
        if (modelName === Book_model_1.Book.name)
            return mockBook;
        return undefined;
    }),
};
describe('Transaction Service Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockBook.available_copies = 5;
        mockStudent.total_fines_due = 0;
    });
    describe('issueBook', () => {
        test('TC_ISSUE_001: Should successfully issue a book and send email', async () => {
            Student_model_1.Student.findByPk.mockResolvedValue(mockStudent);
            Book_model_1.Book.findByPk.mockResolvedValue(mockBook);
            IssueTransaction_model_1.IssueTransaction.findOne.mockResolvedValue(null);
            IssueTransaction_model_1.IssueTransaction.create.mockResolvedValue(mockTransaction);
            await transactionService.issueBook('C001', 'B001');
            expect(mockBook.update).toHaveBeenCalledWith({ available_copies: 4 });
            expect(emailService.sendIssueConfirmation).toHaveBeenCalled();
            expect(IssueTransaction_model_1.IssueTransaction.create).toHaveBeenCalled();
        });
        test('TC_ISSUE_002: Should throw ApiError if book is unavailable', async () => {
            Student_model_1.Student.findByPk.mockResolvedValue(mockStudent);
            mockBook.available_copies = 0;
            Book_model_1.Book.findByPk.mockResolvedValue(mockBook);
            await expect(transactionService.issueBook('C001', 'B001')).rejects.toThrow(errorHandler_1.ApiError);
            await expect(transactionService.issueBook('C001', 'B001')).rejects.toThrow('currently unavailable');
        });
    });
    describe('returnBook', () => {
        test('TC_RETURN_001: Should successfully return a book on time (fine 0)', async () => {
            const onTimeTransaction = { ...mockTransaction,
                due_date: new Date(new Date().getTime() + 5 * MS_PER_DAY),
                get: mockTransaction.get
            };
            IssueTransaction_model_1.IssueTransaction.findByPk.mockResolvedValue(onTimeTransaction);
            await transactionService.returnBook(1);
            expect(onTimeTransaction.update).toHaveBeenCalledWith(expect.objectContaining({
                fine_amount: 0,
                is_returned: true
            }));
            expect(mockStudent.update).toHaveBeenCalledWith({ total_fines_due: 0 });
            expect(mockBook.update).toHaveBeenCalledWith({ available_copies: 6 });
        });
        test('TC_RETURN_002: Should successfully return an overdue book and calculate fine', async () => {
            IssueTransaction_model_1.IssueTransaction.findByPk.mockResolvedValue(mockTransaction);
            mockStudent.total_fines_due = 100;
            await transactionService.returnBook(1);
            expect(mockTransaction.update).toHaveBeenCalledWith(expect.objectContaining({
                fine_amount: 250,
                is_returned: true
            }));
            expect(mockStudent.update).toHaveBeenCalledWith({ total_fines_due: 350 });
        });
    });
    describe('renewBook', () => {
        test('TC_RENEW_001: Should successfully renew an on-time book', async () => {
            const onTimeTransaction = {
                ...mockTransaction,
                due_date: new Date(new Date().getTime() + 5 * MS_PER_DAY),
                get: mockTransaction.get
            };
            IssueTransaction_model_1.IssueTransaction.findByPk.mockResolvedValue(onTimeTransaction);
            await transactionService.renewBook(1);
            expect(onTimeTransaction.update).toHaveBeenCalledWith(expect.objectContaining({
                due_date: expect.any(Date)
            }));
            const updatedArgs = onTimeTransaction.update.mock.calls[0][0];
            expect(updatedArgs.due_date.getTime()).toBeGreaterThan(onTimeTransaction.due_date.getTime());
        });
        test('TC_RENEW_002: Should throw ApiError if book is overdue', async () => {
            IssueTransaction_model_1.IssueTransaction.findByPk.mockResolvedValue(mockTransaction);
            await expect(transactionService.renewBook(1)).rejects.toThrow(errorHandler_1.ApiError);
            await expect(transactionService.renewBook(1)).rejects.toThrow('Book is overdue');
        });
    });
    describe('getCurrentFine', () => {
        test('TC_FINE_004: Should calculate correct live fine for overdue book', async () => {
            IssueTransaction_model_1.IssueTransaction.findByPk.mockResolvedValue(mockTransaction);
            const result = await transactionService.getCurrentFine(1);
            expect(result.fine).toBe(250);
            expect(result.status).toContain('Overdue by');
        });
    });
});
const MS_PER_DAY = 1000 * 60 * 60 * 24;
