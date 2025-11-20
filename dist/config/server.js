"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupServer = setupServer;
const express_1 = __importDefault(require("express"));
require("../models/Student.model");
require("../models/Book.model");
require("../models/IssueTransaction.model");
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./database");
const student_routes_1 = __importDefault(require("../routes/student.routes"));
const book_routes_1 = __importDefault(require("../routes/book.routes"));
const transaction_routes_1 = __importDefault(require("../routes/transaction.routes"));
const errorHandler_1 = require("../utils/errorHandler");
function setupServer(app) {
    (0, database_1.connectDB)();
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.get('/', (req, res) => {
        res.status(200).json({
            message: 'Welcome to College Library Management System API',
            status: 'Running'
        });
    });
    app.use('/api/students', student_routes_1.default);
    app.use('/api/books', book_routes_1.default);
    app.use('/api/transactions', transaction_routes_1.default);
    app.use(errorHandler_1.errorHandler);
    return app;
}
