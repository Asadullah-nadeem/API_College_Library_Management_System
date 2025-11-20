import { Sequelize } from 'sequelize';
import * as dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.DB_NAME as string;
const dbUser = process.env.DB_USER as string;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.DB_PASSWORD;
const dbDialect = 'mysql';


const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: dbDialect,
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
});


export async function connectDB() {
    try {
        await sequelize.authenticate();
        console.log('Database Connection has been established successfully.');
        await sequelize.sync({ alter: true });
        console.log('Database models synchronized.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
}

export default sequelize;