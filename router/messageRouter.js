import express from "express";
import { getAllMessages, sendMessage, delteMessage} from "../controller/messageController.js";
import { isAuthenticated } from "../middlewear/auth.js";

const router = express.Router();

router.post("/send", sendMessage);
router.get("/getall", getAllMessages);
router.delete("/delete/:id", isAuthenticated, delteMessage);

export default router;
