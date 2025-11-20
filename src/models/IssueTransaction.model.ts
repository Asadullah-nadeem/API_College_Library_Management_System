import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { Student } from './Student.model';
import { Book } from './Book.model';

interface IssueTransactionAttributes {
    id: number;
    student_id: string;
    book_id: string;
    issue_date: Date;
    due_date: Date;
    return_date?: Date;
    fine_amount: number;
    is_returned: boolean;
}

interface IssueTransactionCreationAttributes extends Optional<IssueTransactionAttributes, 'id' | 'fine_amount' | 'is_returned' | 'return_date'> {}

export class IssueTransaction extends Model<IssueTransactionAttributes, IssueTransactionCreationAttributes> implements IssueTransactionAttributes {
    public id!: number;
    public student_id!: string;
    public book_id!: string;
    public issue_date!: Date;
    public due_date!: Date;
    public return_date?: Date;
    public fine_amount!: number;
    public is_returned!: boolean;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

IssueTransaction.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    student_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
            model: Student,
            key: 'student_id',
        }
    },
    book_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Book,
            key: 'book_id',
        }
    },
    issue_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    due_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    return_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    fine_amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    is_returned: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    }
}, {
    sequelize,
    tableName: 'IssueTransactions',
});

Student.hasMany(IssueTransaction, { foreignKey: 'student_id' });
IssueTransaction.belongsTo(Student, { foreignKey: 'student_id' });

Book.hasMany(IssueTransaction, { foreignKey: 'book_id' });
IssueTransaction.belongsTo(Book, { foreignKey: 'book_id' });