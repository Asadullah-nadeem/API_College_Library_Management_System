import { Request, Response, NextFunction } from 'express';
import { Student } from '../models/Student.model';
import { ApiError } from '../utils/errorHandler';
import { IssueTransaction } from '../models/IssueTransaction.model';

type ExpressAsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

const asyncHandler = (fn: ExpressAsyncHandler) =>
    (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };


export const createStudent = asyncHandler(async (req, res) => {
    const studentData = req.body;

    if (!studentData.student_id || !studentData.name || !studentData.email) {
        throw new ApiError('Student ID, name, and email are required.', 400);
    }

    const student = await Student.create(studentData);
    res.status(201).json({ success: true, data: student });
});


export const getStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const student = await Student.findByPk(id, {
        include: [{
            model: IssueTransaction,
            where: { is_returned: false },
            required: false
        }],
    });

    if (!student) {
        throw new ApiError('Student not found with this ID.', 404);
    }

    res.status(200).json({ success: true, data: student });
});


export const updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const [updatedRows] = await Student.update(updateData, {
        where: { student_id: id }
    });

    if (updatedRows === 0) {
        throw new ApiError('Student not found or no changes made.', 404);
    }

    const updatedStudent = await Student.findByPk(id);
    res.status(200).json({ success: true, message: 'Student updated successfully.', data: updatedStudent });
});


export const deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedCount = await Student.destroy({
        where: { student_id: id }
    });

    if (deletedCount === 0) {
        throw new ApiError('Student not found.', 404);
    }

    res.status(200).json({ success: true, message: 'Student deleted successfully.' });
});