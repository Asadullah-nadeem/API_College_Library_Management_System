import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface BookAttributes {
    book_id?: string;
    title?: string;
    author?: string;
    isbn?: string;
    total_copies?: number;
    available_copies?: number;
}


export class Book extends Model<BookAttributes> implements BookAttributes {
    public book_id!: string;
    public title!: string;
    public author!: string;
    public isbn!: string;
    public total_copies!: number;
    public available_copies!: number;
}

Book.init({
    book_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    author: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isbn: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
    },
    total_copies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    available_copies: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
}, {
    sequelize,
    tableName: 'Books',
    hooks: {
        beforeUpdate: (book, options) => {
            if (book.available_copies > book.total_copies) {
                throw new Error("Available copies cannot exceed total copies.");
            }
        }
    }
});