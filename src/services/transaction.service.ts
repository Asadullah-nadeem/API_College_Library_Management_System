import { IssueTransaction } from '../models/IssueTransaction.model';
import { Student } from '../models/Student.model';
import { Book } from '../models/Book.model';
import { ApiError } from '../utils/errorHandler';
import { calculateFine } from './fine.service';
import { sendIssueConfirmation } from './email.service';
import * as dotenv from 'dotenv';

dotenv.config();

const MAX_ISSUE_DAYS = parseInt(process.env.MAX_ISSUE_DAYS || '15');
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const issueBook = async (student_id: string, book_id: string) => {

    const student = await Student.findByPk(student_id);
    const book = await Book.findByPk(book_id);

    if (!student) {
        throw new ApiError('Student not found.', 404);
    }

    if (!book) {
        throw new ApiError('Book not found.', 404);
    }

    if (book.available_copies <= 0) {
        throw new ApiError(`Book "${book.title}" is currently unavailable.`, 400);
    }

    const existingIssue = await IssueTransaction.findOne({
        where: { student_id, book_id, is_returned: false },
    });
    
    if (existingIssue) {
        throw new ApiError('Student already has an unreturned copy of this book.', 400);
    }

    const issue_date = new Date();
    const due_date = new Date(issue_date.getTime() + MAX_ISSUE_DAYS * MS_PER_DAY);

    const transaction = await IssueTransaction.create({
        student_id,
        book_id,
        issue_date,
        due_date,
        fine_amount: 0,
        is_returned: false
    });


    await book.update({ available_copies: book.available_copies - 1 });

    await sendIssueConfirmation(student, book, due_date);

    return transaction;
};

export const returnBook = async (transaction_id: number) => {
    const transaction = await IssueTransaction.findByPk(transaction_id, {
        include: [Student, Book]
    });

    if (!transaction) {
        throw new ApiError('Transaction record not found.', 404);
    }
    if (transaction.is_returned) {
        throw new ApiError('This book is already returned.', 400);
    }

    const returnDate = new Date();


    const fine = calculateFine(transaction.due_date, returnDate);


    await transaction.update({
        return_date: returnDate,
        fine_amount: fine,
        is_returned: true
    });

    const student = transaction.get(Student.name) as Student;
    await student.update({ total_fines_due: student.total_fines_due + fine });

    const book = transaction.get(Book.name) as Book;
    if (book) {
        await book.update({ available_copies: book.available_copies + 1 });
    }


    return transaction;
};


export const renewBook = async (transaction_id: number) => {
    const transaction = await IssueTransaction.findByPk(transaction_id);

    if (!transaction) {
        throw new ApiError('Transaction record not found.', 404);
    }
    if (transaction.is_returned) {
        throw new ApiError('Cannot renew a returned book.', 400);
    }

    const today = new Date();

    if (today.getTime() > transaction.due_date.getTime()) {

        const fineDue = calculateFine(transaction.due_date, today);
        throw new ApiError(`Book is overdue. Please return the book or clear the current fine of Rs.${fineDue.toFixed(2)} to renew.`, 400);
    }

    const newDueDate = new Date(today.getTime() + MAX_ISSUE_DAYS * MS_PER_DAY);

    await transaction.update({
        due_date: newDueDate
    });

    return transaction;
};

export const getCurrentFine = async (transaction_id: number) => {
    const transaction = await IssueTransaction.findByPk(transaction_id);

    if (!transaction) {
        throw new ApiError('Transaction record not found.', 404);
    }
    if (transaction.is_returned) {
        return { fine: transaction.fine_amount, status: 'Finalized Fine' };
    }

    const today = new Date();
    const fine = calculateFine(transaction.due_date, today);

    return {
        fine: fine,
        status: fine > 0 ? `Overdue by ${Math.ceil((today.getTime() - transaction.due_date.getTime()) / MS_PER_DAY)} days` : 'Not Overdue'
    };
}
