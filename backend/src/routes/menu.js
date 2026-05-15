import { Router } from "express";
import {
  getMenu,
  getCategories,
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  createCategory,
} from "../controllers/menuController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", getMenu);
router.get("/categories", getCategories);
router.get("/items", getItems);
router.get("/items/:id", getItem);

// Admin/Manager routes
router.post(
  "/categories",
  authenticate,
  authorize("admin", "manager"),
  createCategory,
);
router.post("/items", authenticate, authorize("admin", "manager"), createItem);
router.patch(
  "/items/:id",
  authenticate,
  authorize("admin", "manager"),
  updateItem,
);
router.delete(
  "/items/:id",
  authenticate,
  authorize("admin", "manager"),
  deleteItem,
);

export default router;
