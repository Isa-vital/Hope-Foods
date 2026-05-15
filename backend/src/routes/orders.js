import { Router } from "express";
import {
  createOrder,
  listOrders,
  getOrder,
  updateStatus,
  todayStats,
} from "../controllers/orderController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Public order placement (guest checkout allowed)
router.post("/", createOrder);

// Authenticated routes
router.get(
  "/stats/today",
  authenticate,
  authorize("admin", "manager", "cashier"),
  todayStats,
);
router.get("/", authenticate, listOrders);
router.get("/:id", authenticate, getOrder);
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "manager", "waiter", "kitchen", "cashier"),
  updateStatus,
);

export default router;
