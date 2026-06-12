import express from "express";
import { login, signup, logout, onboard } from "../controllers/authController.js";
import { authUser } from "../middleware/authMiddleware.js"

const authRouter = express.Router();

authRouter.post("/signup", signup);

authRouter.post("/login", login);

authRouter.post("/logout", logout);

authRouter.post("/onboarding", authUser , onboard);


export default authRouter;