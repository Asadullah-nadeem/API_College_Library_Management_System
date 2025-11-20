"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Book = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Book extends sequelize_1.Model {
}
exports.Book = Book;
Book.init({
    book_id: {
        type: sequelize_1.DataTypes.UUID,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    title: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    author: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    isbn: {
        type: sequelize_1.DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    total_copies: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    available_copies: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    sequelize: database_1.default,
    tableName: 'Books',
    hooks: {
        beforeUpdate: (book, options) => {
            if (book.available_copies > book.total_copies) {
                throw new Error("Available copies cannot exceed total copies.");
            }
        }
    }
});
