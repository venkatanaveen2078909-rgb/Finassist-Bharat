import express from "express";
import {
  chat,
  getChatMemory,
  resetChatMemory,
} from "../controllers/chatController.js";

const router = express.Router();

router.post("/", chat);
router.get("/memory", getChatMemory);
router.delete("/memory", resetChatMemory);

export default router;