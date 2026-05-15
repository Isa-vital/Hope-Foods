import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.post(
  "/register",
  [
    body("full_name").trim().isLength({ min: 2 }).withMessage("Name required"),
    body("email")
      .isEmail()
      .withMessage("Valid email required")
      .normalizeEmail(),
    body("phone").optional().isMobilePhone("any"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 chars"),
  ],
  register,
);

router.post(
  "/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  login,
);

router.get("/me", authenticate, getMe);
router.patch("/profile", authenticate, updateProfile);
router.post("/change-password", authenticate, changePassword);

export default router;
