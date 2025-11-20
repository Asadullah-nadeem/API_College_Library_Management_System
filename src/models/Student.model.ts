import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface StudentAttributes {
    student_id: string;
    name: string;
    email: string;
    phone?: string;
    total_fines_due: number;
}

export class Student extends Model<StudentAttributes> implements StudentAttributes {
    public student_id!: string;
    public name!: string;
    public email!: string;
    public phone!: string;
    public total_fines_due!: number;

    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Student.init({
    student_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true,
        }
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    total_fines_due: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    }
}, {
    sequelize,
    tableName: 'Students',
});