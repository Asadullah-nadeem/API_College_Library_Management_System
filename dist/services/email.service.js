"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendIssueConfirmation = exports.sendNotificationEmail = void 0;
const nodemailer = __importStar(require("nodemailer"));
const dotenv = __importStar(require("dotenv"));
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
const sendNotificationEmail = async (student, subject, textContent) => {
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
    }
    catch (error) {
        console.error(`Failed to send email to ${student.email}. Error:`, error);
    }
};
exports.sendNotificationEmail = sendNotificationEmail;
const sendIssueConfirmation = async (student, book, dueDate) => {
    const subject = `Book Issued Successfully: ${book.title}`;
    const textContent = `Dear ${student.name},\n\nThe book "${book.title}" (ISBN: ${book.isbn}) has been successfully issued to you.\n\nDue Date: ${dueDate.toDateString()}\n\nPlease return it by the due date to avoid fines.\n\nThank you,\nCollege Library`;
    await (0, exports.sendNotificationEmail)(student, subject, textContent);
};
exports.sendIssueConfirmation = sendIssueConfirmation;
