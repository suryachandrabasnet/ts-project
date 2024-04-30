import express from "express";
import userController from "../controllers/user.controller";
import { upload } from "../controllers/user.controller";

const router = express.Router();

router.post("/register", upload.single("userImage"), userController.register);
router.post("/login", userController.login);

export default router;
