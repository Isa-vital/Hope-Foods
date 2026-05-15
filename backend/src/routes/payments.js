import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  recordPayment,
  listPayments,
} from "../controllers/paymentController.js";

const router = Router();

router.use(authenticate);
router.use(authorize("admin", "manager", "cashier", "waiter", "reception"));

router.post("/", recordPayment);
router.get("/", listPayments);

export default router;
