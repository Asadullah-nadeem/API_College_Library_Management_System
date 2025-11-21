import { Request, Response, NextFunction } from 'express';
import { Book } from '../models/Book.model';
import { ApiError } from '../utils/errorHandler';

type ExpressAsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: ExpressAsyncHandler) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

export const createBook = asyncHandler(async (req, res) => {
    const bookData = req.body;

    if (!bookData.title || !bookData.author || !bookData.isbn) {
        throw new ApiError('Title, author, and ISBN are required.', 400);
    }

    const total_copies = bookData.total_copies || 1;

    const existingBook = await Book.findOne({ where: { isbn: bookData.isbn } });

    if (existingBook) {
        await existingBook.update({
            total_copies: existingBook.total_copies + total_copies,
            available_copies: existingBook.available_copies + total_copies,
        });
        res.status(200).json({
            success: true,
            message: `Book already exists, copies updated by ${total_copies}.`,
            data: existingBook
        });
    } else {
        const newBook = await Book.create({
            ...bookData,
            total_copies: total_copies,
            available_copies: total_copies,
        });
        res.status(201).json({ success: true, data: newBook });
    }
});


export const getBook = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const book = await Book.findByPk(id);

    if (!book) {
        throw new ApiError('Book not found with this ID.', 404);
    }

    res.status(200).json({ success: true, data: book });
});


export const getAllBooks = asyncHandler(async (req, res) => {
    // Simple pagination/filtering could be added here
    const books = await Book.findAll();
    res.status(200).json({ success: true, count: books.length, data: books });
});

export const updateBook = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedRows] = await Book.update(updateData, {
        where: { book_id: id }
    });

    if (updatedRows === 0) {
        throw new ApiError('Book not found or no changes made.', 404);
    }

    const updatedBook = await Book.findByPk(id);
    res.status(200).json({ success: true, message: 'Book updated successfully.', data: updatedBook });
});


export const deleteBook = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (book && book.available_copies < book.total_copies)
        throw new ApiError('Cannot delete book: some copies are currently issued.', 400);

    const deletedCount = await Book.destroy({
        where: { book_id: id }
    });

    if (deletedCount === 0) {
        throw new ApiError('Book not found.', 404);
    }

    res.status(200).json({ success: true, message: 'Book deleted successfully.' });
});