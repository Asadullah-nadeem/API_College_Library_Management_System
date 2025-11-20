"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBook = exports.updateBook = exports.getAllBooks = exports.getBook = exports.createBook = void 0;
const Book_model_1 = require("../models/Book.model");
const errorHandler_1 = require("../utils/errorHandler");
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.createBook = asyncHandler(async (req, res) => {
    const bookData = req.body;
    if (!bookData.title || !bookData.author || !bookData.isbn) {
        throw new errorHandler_1.ApiError('Title, author, and ISBN are required.', 400);
    }
    const total_copies = bookData.total_copies || 1;
    const existingBook = await Book_model_1.Book.findOne({ where: { isbn: bookData.isbn } });
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
    }
    else {
        const newBook = await Book_model_1.Book.create({
            ...bookData,
            total_copies: total_copies,
            available_copies: total_copies,
        });
        res.status(201).json({ success: true, data: newBook });
    }
});
exports.getBook = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const book = await Book_model_1.Book.findByPk(id);
    if (!book) {
        throw new errorHandler_1.ApiError('Book not found with this ID.', 404);
    }
    res.status(200).json({ success: true, data: book });
});
exports.getAllBooks = asyncHandler(async (req, res) => {
    // Simple pagination/filtering could be added here
    const books = await Book_model_1.Book.findAll();
    res.status(200).json({ success: true, count: books.length, data: books });
});
exports.updateBook = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const [updatedRows] = await Book_model_1.Book.update(updateData, {
        where: { book_id: id }
    });
    if (updatedRows === 0) {
        throw new errorHandler_1.ApiError('Book not found or no changes made.', 404);
    }
    const updatedBook = await Book_model_1.Book.findByPk(id);
    res.status(200).json({ success: true, message: 'Book updated successfully.', data: updatedBook });
});
exports.deleteBook = asyncHandler(async (req, res) => {
    const { id } = req.params;
    // Check if there are any unreturned copies before deletion
    const book = await Book_model_1.Book.findByPk(id);
    if (book && book.available_copies < book.total_copies) {
        throw new errorHandler_1.ApiError('Cannot delete book: some copies are currently issued.', 400);
    }
    const deletedCount = await Book_model_1.Book.destroy({
        where: { book_id: id }
    });
    if (deletedCount === 0) {
        throw new errorHandler_1.ApiError('Book not found.', 404);
    }
    res.status(200).json({ success: true, message: 'Book deleted successfully.' });
});
