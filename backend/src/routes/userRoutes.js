import express from "express";
import {
  getRecommendedUsers,
  getMyFriends,
  sendFriendRequest,
  acceptFriendRequest,
  getFriendRequests,
  getOutgoingFriendRequests,
} from "../controllers/userController.js";
import { authUser } from "../middleware/authMiddleware.js";

const userRouter = express.Router();

// Protect all routes bellow with auth middleware
userRouter.use(authUser);

userRouter.get("/", getRecommendedUsers);
userRouter.get("/friends", getMyFriends);
userRouter.get("/friend-requests", getFriendRequests); 
userRouter.get("/friend-requests/outgoing", getOutgoingFriendRequests);

userRouter.post("/friend-request/:id", sendFriendRequest);
userRouter.post("/friend-request/:id/accept", acceptFriendRequest);

export default userRouter;
