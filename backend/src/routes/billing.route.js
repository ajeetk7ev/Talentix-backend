import express from 'express';
import { 
    getPlans, 
    submitPayment, 
    getPendingRequests, 
    approveSubscription,
    rejectSubscription
} from '../controllers/billing.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/admin.middleware.js';
import { uploadPaymentScreenshot } from '../middlewares/upload.middleware.js';
import { asynchandler } from '../utils/AsyncHandler.js';

const router = express.Router();

router.get("/plans", asynchandler(getPlans));

router.post("/submit", 
    authMiddleware, 
    uploadPaymentScreenshot, 
    asynchandler(submitPayment)
);

// Admin only routes
router.get("/admin/requests", 
    authMiddleware, 
    isAdmin, 
    asynchandler(getPendingRequests)
);

router.patch("/admin/approve/:requestId", 
    authMiddleware, 
    isAdmin, 
    asynchandler(approveSubscription)
);

router.patch("/admin/reject/:requestId", 
    authMiddleware, 
    isAdmin, 
    asynchandler(rejectSubscription)
);

export default router;
