import express from "express";
import { getStreamToken } from "../controllers/chatController.js";
import { authUser } from "../middleware/authMiddleware.js";

const chatRouter = express.Router();

chatRouter.get("/token", authUser, getStreamToken);

export default chatRouter;