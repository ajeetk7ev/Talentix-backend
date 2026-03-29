import express from 'express';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import { getAllReports, deleteFlaggedJob } from '../controllers/admin.controller.js';
import { asynchandler } from '../utils/AsyncHandler.js';

const router = express.Router();

// Apply stacked middleware enforcing strict Admin boundaries natively
router.use(authMiddleware, isAdmin);

router.get("/reports", asynchandler(getAllReports));
router.delete("/jobs/:id", asynchandler(deleteFlaggedJob));

export default router;
