import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  getCurrentShift,
  openShift,
  closeShift,
  listShifts,
} from "../controllers/shiftController.js";
import { listActivityLogs } from "../controllers/activityLogController.js";

const router = Router();

// Shifts
router.use("/shifts", authenticate);
router.get(
  "/shifts/current",
  authorize("admin", "manager", "cashier", "waiter", "reception"),
  getCurrentShift,
);
router.post(
  "/shifts/open",
  authorize("admin", "manager", "cashier", "waiter", "reception"),
  openShift,
);
router.post(
  "/shifts/:id/close",
  authorize("admin", "manager", "cashier", "waiter", "reception"),
  closeShift,
);
router.get(
  "/shifts",
  authorize("admin", "manager", "cashier", "waiter", "reception"),
  listShifts,
);

// Activity logs (admin/manager only)
router.get(
  "/activity-logs",
  authenticate,
  authorize("admin", "manager"),
  listActivityLogs,
);

export default router;
