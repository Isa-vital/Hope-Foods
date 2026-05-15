import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  createBooking,
  getBooking,
  listBookings,
  updateBookingStatus,
  myBookings,
} from "../controllers/bookingController.js";

const router = Router();

// Customer's own bookings (must be before /:id)
router.get("/me", authenticate, myBookings);

// Public
router.post("/", createBooking);
router.get("/:id", getBooking);

// Staff
router.get(
  "/",
  authenticate,
  authorize("admin", "manager", "reception"),
  listBookings,
);
router.patch(
  "/:id/status",
  authenticate,
  authorize("admin", "manager", "reception"),
  updateBookingStatus,
);

export default router;
