import { Router } from 'express';
import * as studentController from '../controllers/student.controller';

const router = Router();

router.post('/', studentController.createStudent);
router.get('/:id', studentController.getStudent);
router.put('/:id', studentController.updateStudent);
router.delete('/:id', studentController.deleteStudent);

export default router;