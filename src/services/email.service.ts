import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import { Student } from '../models/Student.model';
import { Book } from '../models/Book.model';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendNotificationEmail = async (student: Student, subject: string, textContent: string) => {
    const mailOptions = {
        from: `"College Library" <${process.env.SENDER_EMAIL}>`,
        to: student.email,
        subject: subject,
        text: textContent,
        html: `<p>${textContent.replace(/\n/g, '<br>')}</p>`, // Simple HTML conversion
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${student.email}: ${info.messageId}`);
        // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error(`Failed to send email to ${student.email}. Error:`, error);
    }
};


export const sendIssueConfirmation = async (student: Student, book: Book, dueDate: Date) => {
    const subject = `Book Issued Successfully: ${book.title}`;
    const textContent = `Dear ${student.name},\n\nThe book "${book.title}" (ISBN: ${book.isbn}) has been successfully issued to you.\n\nDue Date: ${dueDate.toDateString()}\n\nPlease return it by the due date to avoid fines.\n\nThank you,\nCollege Library`;

    await sendNotificationEmail(student, subject, textContent);
};

