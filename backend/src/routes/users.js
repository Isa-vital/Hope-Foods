import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

const router = Router();

router.use(authenticate);
router.get("/", authorize("admin", "manager"), listUsers);
router.post("/", authorize("admin"), createUser);
router.patch("/:id", authorize("admin"), updateUser);
router.delete("/:id", authorize("admin"), deleteUser);

export default router;
