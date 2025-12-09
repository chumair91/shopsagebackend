import express from "express";
import {
  getUserInfo,
  loginUser,
  registerUser,
  adminLogin,
} from "../controllers/userController.js";

const userRouter = express.Router();
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/admin", adminLogin);


// Add this route
userRouter.get("/me", getUserInfo);
export default userRouter;
 