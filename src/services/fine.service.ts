import * as dotenv from 'dotenv';

dotenv.config();

const FINE_RATE = parseFloat(process.env.FINE_RATE_PER_DAY || '50');
const MS_PER_DAY = 1000 * 60 * 60 * 24;

export const calculateFine = (dueDate: Date, returnDate: Date): number => {
    const dueDateTime = dueDate.getTime();
    const returnDateTime = returnDate.getTime();

    if (returnDateTime <= dueDateTime) {
        return 0;
    }

    const timeDiff = returnDateTime - dueDateTime;
    const dayDiff = Math.ceil(timeDiff / MS_PER_DAY);

    if (dayDiff < 0) {
        return 0;
    }

    const fineAmount = dayDiff * FINE_RATE;

    return Math.round(fineAmount * 100) / 100;
};