"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStudent = exports.updateStudent = exports.getStudent = exports.createStudent = void 0;
const Student_model_1 = require("../models/Student.model");
const errorHandler_1 = require("../utils/errorHandler");
const IssueTransaction_model_1 = require("../models/IssueTransaction.model");
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
exports.createStudent = asyncHandler(async (req, res) => {
    const studentData = req.body;
    if (!studentData.student_id || !studentData.name || !studentData.email) {
        throw new errorHandler_1.ApiError('Student ID, name, and email are required.', 400);
    }
    const student = await Student_model_1.Student.create(studentData);
    res.status(201).json({ success: true, data: student });
});
exports.getStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const student = await Student_model_1.Student.findByPk(id, {
        include: [{
                model: IssueTransaction_model_1.IssueTransaction,
                where: { is_returned: false },
                required: false
            }],
    });
    if (!student) {
        throw new errorHandler_1.ApiError('Student not found with this ID.', 404);
    }
    res.status(200).json({ success: true, data: student });
});
exports.updateStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    const [updatedRows] = await Student_model_1.Student.update(updateData, {
        where: { student_id: id }
    });
    if (updatedRows === 0) {
        throw new errorHandler_1.ApiError('Student not found or no changes made.', 404);
    }
    const updatedStudent = await Student_model_1.Student.findByPk(id);
    res.status(200).json({ success: true, message: 'Student updated successfully.', data: updatedStudent });
});
exports.deleteStudent = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedCount = await Student_model_1.Student.destroy({
        where: { student_id: id }
    });
    if (deletedCount === 0) {
        throw new errorHandler_1.ApiError('Student not found.', 404);
    }
    res.status(200).json({ success: true, message: 'Student deleted successfully.' });
});
