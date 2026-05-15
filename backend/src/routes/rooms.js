import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  listRoomTypes,
  createRoomType,
  updateRoomType,
  listRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  checkAvailability,
} from "../controllers/roomController.js";

const router = Router();

// Public endpoints
router.get("/types", listRoomTypes);
router.get("/availability", checkAvailability);
router.get("/", listRooms);

// Staff endpoints
router.post(
  "/types",
  authenticate,
  authorize("admin", "manager"),
  createRoomType,
);
router.patch(
  "/types/:id",
  authenticate,
  authorize("admin", "manager"),
  updateRoomType,
);
router.post("/", authenticate, authorize("admin", "manager"), createRoom);
router.patch(
  "/:id",
  authenticate,
  authorize("admin", "manager", "reception"),
  updateRoom,
);
router.delete("/:id", authenticate, authorize("admin", "manager"), deleteRoom);

export default router;
