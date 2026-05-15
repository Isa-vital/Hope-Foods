import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  listReservations,
  getReservation,
  createReservation,
  updateReservationStatus,
} from "../controllers/reservationController.js";

const router = Router();

// Public
router.post("/", createReservation);
router.get("/:id", getReservation);

// Staff
router.get(
  "/",
  authenticate,
  authorize("admin", "manager", "waiter", "reception"),
  listReservations,
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "manager", "waiter", "reception"),
  updateReservationStatus,
);

export default router;
