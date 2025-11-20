"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IssueTransaction = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
const Student_model_1 = require("./Student.model");
const Book_model_1 = require("./Book.model");
class IssueTransaction extends sequelize_1.Model {
}
exports.IssueTransaction = IssueTransaction;
IssueTransaction.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    student_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        references: {
            model: Student_model_1.Student,
            key: 'student_id',
        }
    },
    book_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: Book_model_1.Book,
            key: 'book_id',
        }
    },
    issue_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    due_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    return_date: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    fine_amount: {
        type: sequelize_1.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    is_returned: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
}, {
    sequelize: database_1.default,
    tableName: 'IssueTransactions',
});
Student_model_1.Student.hasMany(IssueTransaction, { foreignKey: 'student_id' });
IssueTransaction.belongsTo(Student_model_1.Student, { foreignKey: 'student_id' });
Book_model_1.Book.hasMany(IssueTransaction, { foreignKey: 'book_id' });
IssueTransaction.belongsTo(Book_model_1.Book, { foreignKey: 'book_id' });
