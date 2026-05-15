import { Router } from "express";
import authRoutes from "./auth.js";
import menuRoutes from "./menu.js";
import orderRoutes from "./orders.js";
import reservationRoutes from "./reservations.js";
import tableRoutes from "./tables.js";
import paymentRoutes from "./payments.js";
import roomRoutes from "./rooms.js";
import bookingRoutes from "./bookings.js";
import inventoryRoutes from "./inventory.js";
import reportRoutes from "./reports.js";
import uploadRoutes from "./uploads.js";
import miscRoutes from "./misc.js";
import userRoutes from "./users.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    name: "Hope Foods API",
    version: "1.0.0",
    status: "running",
    endpoints: {
      auth: "/api/auth",
      menu: "/api/menu",
      orders: "/api/orders",
      reservations: "/api/reservations",
      tables: "/api/tables",
      payments: "/api/payments",
      rooms: "/api/rooms",
      bookings: "/api/bookings",
      health: "/api/health",
    },
  });
});

router.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

router.use("/auth", authRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);
router.use("/reservations", reservationRoutes);
router.use("/tables", tableRoutes);
router.use("/payments", paymentRoutes);
router.use("/rooms", roomRoutes);
router.use("/bookings", bookingRoutes);
router.use("/inventory", inventoryRoutes);
router.use("/reports", reportRoutes);
router.use("/uploads", uploadRoutes);
router.use("/users", userRoutes);
router.use("/", miscRoutes);

export default router;
