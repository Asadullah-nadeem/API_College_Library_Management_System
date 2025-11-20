import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { Student } from '../models/Student.model';
import { Book } from '../models/Book.model';

dotenv.config();

const SMTP_PORT_NUMBER = parseInt(process.env.SMTP_PORT || '587');
const IS_SECURE = SMTP_PORT_NUMBER === 465;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: SMTP_PORT_NUMBER,
    secure: IS_SECURE,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },

});

export const verifySmtpConnection = () => {
    transporter.verify((error, success) => {
        if (error) {
            console.error("❌ SMTP Connection Error. Check HOST, PORT, and AUTH details:", error);
        } else {
            console.log("✅ SMTP Server is ready to take messages.");
        }
    });
}

export const sendNotificationEmail = async (student: Student, subject: string, textContent: string) => {

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SENDER_EMAIL) {
        console.error("⚠️ Email functionality is skipped: Missing SMTP configuration in .env");
        return;
    }

    const mailOptions = {
        from: `"College Library" <${process.env.SENDER_EMAIL}>`,
        to: student.email,
        subject: subject,
        text: textContent,
        html: `<p>${textContent.replace(/\n/g, '<br>')}</p>`,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to ${student.email}. Message ID: ${info.messageId}`);
    } catch (error) {
        console.error(`🚨 FAILED to send email to ${student.email}. Check .env credentials, SMTP Host, and Port. FULL ERROR:`, error);
    }
};


export const sendIssueConfirmation = async (student: Student, book: Book, dueDate: Date) => {
    const subject = `Book Issued Successfully: ${book.title}`;
    const textContent = `Dear ${student.name},\n\nThe book "${book.title}" (ISBN: ${book.isbn}) has been successfully issued to you.\n\nDue Date: ${dueDate.toDateString()}\n\nPlease return it by the due date to avoid fines.\n\nThank you,\nCollege Library`;

    await sendNotificationEmail(student, subject, textContent);
};