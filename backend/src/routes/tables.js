import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  listTables,
  createTable,
  updateTable,
  deleteTable,
} from "../controllers/reservationController.js";

const router = Router();

router.get("/", listTables);
router.post("/", authenticate, authorize("admin", "manager"), createTable);
router.patch("/:id", authenticate, authorize("admin", "manager"), updateTable);
router.delete("/:id", authenticate, authorize("admin", "manager"), deleteTable);

export default router;
