import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';

const router = Router();

router.post('/issue', transactionController.issueBook);
router.put('/return/:id', transactionController.returnBook);
router.put('/renew/:id', transactionController.renewBook);
router.get('/fine/:id', transactionController.calculateFine);

export default router;