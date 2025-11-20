import * as transactionService from '../../src/services/transaction.service';
import { ApiError } from '../../src/utils/errorHandler';
import { Student } from '../../src/models/Student.model';
import { Book } from '../../src/models/Book.model';
import { IssueTransaction } from '../../src/models/IssueTransaction.model';
import * as emailService from '../../src/services/email.service';

jest.mock('../../src/models/Student.model');
jest.mock('../../src/models/Book.model');
jest.mock('../../src/models/IssueTransaction.model');
jest.mock('../../src/services/email.service');

const mockStudent: Partial<Student> = {
    student_id: 'C001',
    name: 'Test Student',
    email: 'test@example.com',
    total_fines_due: 0,
    update: jest.fn().mockResolvedValue(true) as any,
};

const mockBook: Partial<Book> = {
    book_id: 'B001',
    title: 'Test Book',
    author: 'Author',
    available_copies: 5,
    total_copies: 10,
    update: jest.fn().mockResolvedValue(true) as any,
};

const mockTransaction = {
    id: 1,
    student_id: 'C001',
    book_id: 'B001',
    issue_date: new Date(new Date().getTime() - 10 * 24 * 60 * 60 * 1000),
    due_date: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
    fine_amount: 0,
    is_returned: false,
    update: jest.fn().mockResolvedValue(true) as any,
    get: jest.fn((modelName: string) => {
        if (modelName === Student.name) return mockStudent;
        if (modelName === Book.name) return mockBook;
        return undefined;
    }) as any,
};


describe('Transaction Service Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        (mockBook as any).available_copies = 5;
        (mockStudent as any).total_fines_due = 0;
    });

    describe('issueBook', () => {

        test('TC_ISSUE_001: Should successfully issue a book and send email', async () => {
            (Student.findByPk as jest.Mock).mockResolvedValue(mockStudent);
            (Book.findByPk as jest.Mock).mockResolvedValue(mockBook);
            (IssueTransaction.findOne as jest.Mock).mockResolvedValue(null);
            (IssueTransaction.create as jest.Mock).mockResolvedValue(mockTransaction);

            await transactionService.issueBook('C001', 'B001');

            expect(mockBook.update).toHaveBeenCalledWith({ available_copies: 4 });
            expect(emailService.sendIssueConfirmation).toHaveBeenCalled();
            expect(IssueTransaction.create).toHaveBeenCalled();
        });

        test('TC_ISSUE_002: Should throw ApiError if book is unavailable', async () => {
            (Student.findByPk as jest.Mock).mockResolvedValue(mockStudent);
            (mockBook as any).available_copies = 0;
            (Book.findByPk as jest.Mock).mockResolvedValue(mockBook);

            await expect(transactionService.issueBook('C001', 'B001')).rejects.toThrow(ApiError);
            await expect(transactionService.issueBook('C001', 'B001')).rejects.toThrow('currently unavailable');
        });
    });

    describe('returnBook', () => {

        test('TC_RETURN_001: Should successfully return a book on time (fine 0)', async () => {
            const onTimeTransaction = { ...mockTransaction,
                due_date: new Date(new Date().getTime() + 5 * MS_PER_DAY),
                get: mockTransaction.get
            };

            (IssueTransaction.findByPk as jest.Mock).mockResolvedValue(onTimeTransaction);

            await transactionService.returnBook(1);

            expect(onTimeTransaction.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    fine_amount: 0,
                    is_returned: true
                })
            );
            expect(mockStudent.update).toHaveBeenCalledWith({ total_fines_due: 0 });
            expect(mockBook.update).toHaveBeenCalledWith({ available_copies: 6 });
        });

        test('TC_RETURN_002: Should successfully return an overdue book and calculate fine', async () => {
            (IssueTransaction.findByPk as jest.Mock).mockResolvedValue(mockTransaction);
            (mockStudent as any).total_fines_due = 100;

            await transactionService.returnBook(1);

            expect(mockTransaction.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    fine_amount: 250,
                    is_returned: true
                })
            );
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
            (IssueTransaction.findByPk as jest.Mock).mockResolvedValue(onTimeTransaction);

            await transactionService.renewBook(1);

            expect(onTimeTransaction.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    due_date: expect.any(Date)
                })
            );
            const updatedArgs = (onTimeTransaction.update as jest.Mock).mock.calls[0][0];
            expect(updatedArgs.due_date.getTime()).toBeGreaterThan(onTimeTransaction.due_date.getTime());
        });

        test('TC_RENEW_002: Should throw ApiError if book is overdue', async () => {
            (IssueTransaction.findByPk as jest.Mock).mockResolvedValue(mockTransaction);

            await expect(transactionService.renewBook(1)).rejects.toThrow(ApiError);
            await expect(transactionService.renewBook(1)).rejects.toThrow('Book is overdue');
        });
    });

    describe('getCurrentFine', () => {

        test('TC_FINE_004: Should calculate correct live fine for overdue book', async () => {
            (IssueTransaction.findByPk as jest.Mock).mockResolvedValue(mockTransaction);

            const result = await transactionService.getCurrentFine(1);

            expect(result.fine).toBe(250);
            expect(result.status).toContain('Overdue by');
        });
    });
});

const MS_PER_DAY = 1000 * 60 * 60 * 24;